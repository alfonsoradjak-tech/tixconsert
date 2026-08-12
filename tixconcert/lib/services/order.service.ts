import { getDBValue, mutate, type DBShape } from "@/lib/db";
import type {
  ConcertEvent,
  Order,
  PaymentMethod,
  Payment,
  Ticket,
} from "@/lib/types";
import {
  genId,
  genOrderId,
  genPaymentReference,
  genTicketQR,
} from "@/lib/utils";

const PAYMENT_EXPIRY_MS = 24 * 60 * 60 * 1000;

export interface CheckoutInput {
  userId: string;
  event: ConcertEvent;
  customer: { name: string; email: string; phone: string };
  items: { ticketCategoryId: string; qty: number; seats: string[] }[];
  method: PaymentMethod;
  promoCode?: string;
}

export interface CheckoutResult {
  ok: boolean;
  error?: string;
  order?: Order;
  payment?: Payment;
  deadline?: number;
}

export function serviceFeeFor(subtotal: number) {
  return Math.round(subtotal * 0.05);
}

export function paymentFeeFor(method: PaymentMethod, subtotal: number) {
  switch (method) {
    case "ewallet":
    case "qris":
      return 2500;
    case "credit_card":
      return Math.round(subtotal * 0.02);
    default:
      return 6500;
  }
}

export function createOrder(input: CheckoutInput): CheckoutResult {
  return mutate((db) => {
    let subtotal = 0;
    for (const item of input.items) {
      const cat = input.event.ticketCategories.find(
        (c) => c.id === item.ticketCategoryId
      );
      if (!cat) return { ok: false, error: "Kategori tiket tidak ditemukan." };
      if (cat.sold + item.qty > cat.quantity) {
        return {
          ok: false,
          error: `Maaf, tiket ${cat.name} tinggal ${Math.max(
            0,
            cat.quantity - cat.sold
          )} tersisa.`,
        };
      }
      subtotal += cat.price * item.qty;
    }

    if (input.event.hasSeatLayout) {
      for (const item of input.items) {
        for (const seat of item.seats) {
          const taken = db.orders.some(
            (o) =>
              o.eventId === input.event.id &&
              (o.status === "paid" || o.status === "pending") &&
              o.items.some((oi) => oi.seats.includes(seat))
          );
          if (taken) {
            return {
              ok: false,
              error: `Kursi ${seat} baru saja dipesan oleh pengguna lain.`,
            };
          }
        }
      }
    }

    const promo = db.promos.find(
      (p) =>
        p.code === input.promoCode?.toUpperCase() &&
        p.active &&
        new Date(p.expiresAt + "T23:59:59") >= new Date()
    );
    let discount = 0;
    if (input.promoCode) {
      if (!promo) {
        return { ok: false, error: "Kode voucher tidak valid atau sudah kedaluwarsa." };
      }
      if (promo.usageLimit > 0 && promo.usedCount >= promo.usageLimit) {
        return { ok: false, error: "Kode voucher sudah melebihi batas pemakaian." };
      }
      if (subtotal < promo.minPurchase) {
        return {
          ok: false,
          error: `Minimum pembelian Rp${promo.minPurchase.toLocaleString("id-ID")} untuk kode ini.`,
        };
      }
      discount = Math.min(
        Math.round(subtotal * (promo.discountPercent / 100)),
        promo.maxDiscount
      );
    }

    const serviceFee = serviceFeeFor(subtotal);
    const paymentFee = paymentFeeFor(input.method, subtotal);
    const total = subtotal + serviceFee + paymentFee - discount;

    const orderId = genOrderId();
    const order: Order = {
      id: genId("ord"),
      orderId,
      userId: input.userId,
      eventId: input.event.id,
      customerName: input.customer.name.trim(),
      customerEmail: input.customer.email.trim(),
      customerPhone: input.customer.phone.trim(),
      items: input.items.map((it) => {
        const cat = input.event.ticketCategories.find(
          (c) => c.id === it.ticketCategoryId
        )!;
        return {
          id: genId("oi"),
          ticketCategoryId: cat.id,
          ticketType: cat.name,
          quantity: it.qty,
          unitPrice: cat.price,
          seats: it.seats,
        };
      }),
      subtotal,
      serviceFee,
      discount,
      paymentFee,
      total,
      promoCode: promo?.code,
      paymentMethod: input.method,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    db.orders.unshift(order);

    for (const item of input.items) {
      const cat = input.event.ticketCategories.find(
        (c) => c.id === item.ticketCategoryId
      )!;
      cat.sold += item.qty;
      for (let i = 0; i < item.qty; i += 1) {
        const ticketId = genId("tkt");
        const ticket: Ticket = {
          id: ticketId,
          orderId,
          orderItemId: item.ticketCategoryId,
          eventId: input.event.id,
          userId: input.userId,
          ticketType: cat.name,
          price: cat.price,
          seat: item.seats[i],
          qr: genTicketQR({
            ticketId,
            orderId,
            eventId: input.event.id,
            userId: input.userId,
          }),
          status: "pending",
        };
        db.tickets.unshift(ticket);
      }
    }

    if (promo) promo.usedCount += 1;

    const payment: Payment = {
      id: genId("pay"),
      orderId,
      amount: total,
      method: input.method,
      status: "pending",
      reference: genPaymentReference(),
      createdAt: new Date().toISOString(),
    };
    db.payments.unshift(payment);

    return { ok: true, order, payment, deadline: Date.now() + PAYMENT_EXPIRY_MS };
  });
}

export function confirmPayment(orderId: string, userId: string) {
  return mutate((db) => {
    const order = db.orders.find((o) => o.id === orderId);
    if (!order) return { ok: false, error: "Order tidak ditemukan." };
    if (order.status !== "pending")
      return { ok: false, error: "Order tidak dalam status pending." };
    order.status = "paid";
    order.paidAt = new Date().toISOString();
    const payment = db.payments.find((p) => p.orderId === orderId);
    if (payment) {
      payment.status = "paid";
      payment.paidAt = new Date().toISOString();
    }
    for (const t of db.tickets) {
      if (t.orderId === orderId) t.status = "paid";
    }
    db.notifications.push({
      id: genId("ntf"),
      userId: order.userId,
      title: "Pembayaran Berhasil",
      message: `Pembayaran order ${order.orderId} berhasil. E-ticket kamu sudah tersedia di My Tickets.`,
      type: "success",
      read: false,
      createdAt: new Date().toISOString(),
    });
    if (userId && userId !== order.userId) {
      db.notifications.push({
        id: genId("ntf"),
        userId,
        title: "Order Diperbarui",
        message: `Order ${order.orderId} berhasil diverifikasi sebagai PAID.`,
        type: "info",
        read: false,
        createdAt: new Date().toISOString(),
      });
    }
    return { ok: true, order };
  });
}

export function cancelOrder(orderId: string) {
  return mutate((db) => {
    const order = db.orders.find((o) => o.id === orderId);
    if (!order) return { ok: false };
    if (order.status === "paid") return { ok: false, error: "Order sudah dibayar." };
    order.status = "cancelled";
    releaseReserved(db, order);
    for (const t of db.tickets) if (t.orderId === orderId) t.status = "cancelled";
    return { ok: true };
  });
}

export function refundOrder(orderId: string) {
  return mutate((db) => {
    const order = db.orders.find((o) => o.id === orderId);
    if (!order) return { ok: false };
    if (order.status !== "paid")
      return { ok: false, error: "Hanya order PAID yang bisa di-refund." };
    order.status = "refunded";
    const payment = db.payments.find((p) => p.orderId === orderId);
    if (payment) payment.status = "refunded";
    for (const t of db.tickets) if (t.orderId === orderId) t.status = "refunded";
    releaseReserved(db, order);
    db.notifications.push({
      id: genId("ntf"),
      userId: order.userId,
      title: "Refund Berhasil",
      message: `Refund order ${order.orderId} sebesar Rp${order.total.toLocaleString("id-ID")} sedang diproses ke rekening kamu.`,
      type: "success",
      read: false,
      createdAt: new Date().toISOString(),
    });
    return { ok: true };
  });
}

function releaseReserved(
  db: DBShape,
  order: Order
) {
  const event = db.events.find((e) => e.id === order.eventId);
  if (!event) return;
  for (const item of order.items) {
    const cat = event.ticketCategories.find((c) => c.id === item.ticketCategoryId);
    if (cat) {
      cat.sold = Math.max(0, cat.sold - item.quantity);
    }
  }
}

export function expirePendingOrders() {
  return mutate((db) => {
    const cutoff = Date.now() - PAYMENT_EXPIRY_MS;
    for (const order of db.orders) {
      if (
        order.status === "pending" &&
        new Date(order.createdAt).getTime() < cutoff
      ) {
        order.status = "expired";
        releaseReserved(db, order);
        for (const t of db.tickets) {
          if (t.orderId === order.id) t.status = "cancelled";
        }
      }
    }
  });
}

export function getUserOrders(userId: string): Order[] {
  return getDBValue()
    .orders.filter((o) => o.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getUserTickets(userId: string): Ticket[] {
  const db = getDBValue();
  const orderTime = new Map(db.orders.map((o) => [o.id, o.createdAt]));
  return db.tickets
    .filter((t) => t.userId === userId)
    .sort((a, b) => {
      const ta = orderTime.get(a.orderId) ?? "";
      const tb = orderTime.get(b.orderId) ?? "";
      return tb.localeCompare(ta);
    });
}

export function getOrderByPublicId(orderId: string) {
  return getDBValue().orders.find((o) => o.orderId === orderId);
}

export function getOrderById(id: string) {
  return getDBValue().orders.find((o) => o.id === id);
}

export function getTicketById(id: string) {
  return getDBValue().tickets.find((t) => t.id === id);
}

export function validatePromo(
  code: string,
  subtotal: number
): { valid: boolean; discount?: number; error?: string; minPurchase?: number } {
  const db = getDBValue();
  const promo = db.promos.find(
    (p) =>
      p.code === code.toUpperCase() &&
      p.active &&
      new Date(p.expiresAt + "T23:59:59") >= new Date()
  );
  if (!promo) return { valid: false, error: "Kode voucher tidak valid." };
  if (promo.usageLimit > 0 && promo.usedCount >= promo.usageLimit)
    return { valid: false, error: "Kuota voucher sudah habis." };
  if (subtotal < promo.minPurchase)
    return {
      valid: false,
      error: `Min. pembelian ${promo.minPurchase.toLocaleString("id-ID")}`,
      minPurchase: promo.minPurchase,
    };
  return {
    valid: true,
    discount: Math.min(
      Math.round(subtotal * (promo.discountPercent / 100)),
      promo.maxDiscount
    ),
  };
}
