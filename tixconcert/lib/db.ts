import { useSyncExternalStore } from "react";
import type {
  AppNotification,
  Artist,
  Checkin,
  ConcertEvent,
  Favorite,
  Order,
  Payment,
  Promo,
  Ticket,
  User,
  Venue,
} from "@/lib/types";
import {
  seedArtists,
  seedEvents,
  seedPromos,
  seedUsers,
  seedVenues,
} from "@/lib/seed-data";
import { genPaymentReference, genTicketQR } from "@/lib/utils";

export interface DBShape {
  version: number;
  users: User[];
  artists: Artist[];
  venues: Venue[];
  events: ConcertEvent[];
  promos: Promo[];
  orders: Order[];
  tickets: Ticket[];
  payments: Payment[];
  checkins: Checkin[];
  favorites: Favorite[];
  notifications: AppNotification[];
}

const DB_KEY = "tixconcert_db_v1";
const SEED_VERSION = 5;

const listeners = new Set<() => void>();
let cached: DBShape | null = null;

function buildSeedOrders(): Pick<
  DBShape,
  "orders" | "tickets" | "payments" | "checkins"
> {
  const orders: Order[] = [];
  const tickets: Ticket[] = [];
  const payments: Payment[] = [];
  const checkins: Checkin[] = [];

  const now = Date.now();
  const d = (offsetDays: number) =>
    new Date(now + offsetDays * 86400000).toISOString();

  const addOrder = (input: {
    num: number;
    userId: string;
    event: ConcertEvent;
    customer: { name: string; email: string; phone: string };
    catName: string;
    qty: number;
    seats?: string[];
    method: Order["paymentMethod"];
    status: Order["status"];
    createdOffset: number;
    paidOffset?: number;
    checkinOffset?: number;
    checkinBy?: string;
  }) => {
    const cat = input.event.ticketCategories.find(
      (c) => c.name === input.catName
    )!;
    const orderId = `TIX-2026-${String(input.num).padStart(6, "0")}`;
    const subtotal = cat.price * input.qty;
    const serviceFee = Math.round(subtotal * 0.05);
    const paymentFee =
      input.method === "ewallet" || input.method === "qris"
        ? 2500
        : input.method === "credit_card"
          ? Math.round(subtotal * 0.02)
          : 6500;
    const total = subtotal + serviceFee + paymentFee;
    const orderItemId = `oi_${input.event.id}_${input.num}`;
    const order: Order = {
      id: `ord_${input.num}`,
      orderId,
      userId: input.userId,
      eventId: input.event.id,
      customerName: input.customer.name,
      customerEmail: input.customer.email,
      customerPhone: input.customer.phone,
      items: [
        {
          id: orderItemId,
          ticketCategoryId: cat.id,
          ticketType: cat.name,
          quantity: input.qty,
          unitPrice: cat.price,
          seats: input.seats ?? [],
        },
      ],
      subtotal,
      serviceFee,
      discount: 0,
      paymentFee,
      total,
      paymentMethod: input.method,
      status: input.status,
      createdAt: d(-input.createdOffset),
      paidAt: input.paidOffset != null ? d(-input.paidOffset) : undefined,
    };
    orders.push(order);

    if (input.status !== "cancelled" && input.status !== "expired") {
      for (let i = 0; i < input.qty; i += 1) {
        const ticketId = `tkt_${input.event.id}_${input.num}_${i + 1}`;
        const t: Ticket = {
          id: ticketId,
          orderId,
          orderItemId,
          eventId: input.event.id,
          userId: input.userId,
          ticketType: cat.name,
          price: cat.price,
          seat: input.seats?.[i],
          qr: genTicketQR({
            ticketId,
            orderId,
            eventId: input.event.id,
            userId: input.userId,
          }),
          status:
            input.status === "refunded"
              ? "refunded"
              : input.checkinOffset != null
                ? "used"
                : "paid",
          checkInAt:
            input.checkinOffset != null ? d(-input.checkinOffset) : undefined,
          checkInBy: input.checkinBy,
        };
        tickets.push(t);
        if (input.checkinOffset != null) {
          checkins.push({
            id: `ck_${ticketId}`,
            ticketId,
            eventId: input.event.id,
            checkedInAt: d(-input.checkinOffset),
            checkInBy: input.checkinBy ?? "usr_staff",
          });
        }
      }
    }

    if (input.status === "paid" || input.status === "refunded") {
      payments.push({
        id: `pay_${input.num}`,
        orderId,
        amount: total,
        method: input.method,
        status:
          input.status === "refunded" ? "refunded" : "paid",
        reference: genPaymentReference(),
        createdAt: d(-input.createdOffset),
        paidAt: input.paidOffset != null ? d(-input.paidOffset) : undefined,
      });
    } else if (input.status === "pending") {
      payments.push({
        id: `pay_${input.num}`,
        orderId,
        amount: total,
        method: input.method,
        status: "pending",
        reference: genPaymentReference(),
        createdAt: d(-input.createdOffset),
      });
    }
  };

  const ev = (slug: string) => seedEvents.find((e) => e.slug === slug)!;
  const cus = {
    demo: { name: "Ahmad Pratama", email: "user@tixconcert.com", phone: "081355511122" },
    ria: { name: "Ria Anggraini", email: "ria@gmail.com", phone: "081377788899" },
    bayu: { name: "Bayu Saputra", email: "bayu@gmail.com", phone: "081322233344" },
    putri: { name: "Putri Ayu", email: "putri@gmail.com", phone: "081366677788" },
    dimas: { name: "Dimas Nugroho", email: "dimas@gmail.com", phone: "081344455566" },
  };

  addOrder({ num: 1, userId: "usr_demo", event: ev("soundwave-festival-2026"), customer: cus.demo, catName: "Festival", qty: 2, method: "qris", status: "paid", createdOffset: 18, paidOffset: 18 });
  addOrder({ num: 2, userId: "usr_demo", event: ev("tulus-harmoni"), customer: cus.demo, catName: "VIP", qty: 1, seats: ["A5"], method: "credit_card", status: "paid", createdOffset: 15, paidOffset: 15 });
  addOrder({ num: 3, userId: "usr_demo", event: ev("rock-revolution"), customer: cus.demo, catName: "Regular", qty: 2, seats: ["J4", "J5"], method: "bank_transfer", status: "paid", createdOffset: 40, paidOffset: 39, checkinOffset: 3, checkinBy: "usr_staff" });
  addOrder({ num: 4, userId: "usr_demo", event: ev("summer-beats"), customer: cus.demo, catName: "Regular", qty: 1, method: "virtual_account", status: "paid", createdOffset: 45, paidOffset: 45, checkinOffset: 32, checkinBy: "usr_staff" });
  addOrder({ num: 5, userId: "usr_ria", event: ev("edm-universe"), customer: cus.ria, catName: "VIP", qty: 1, method: "qris", status: "paid", createdOffset: 8, paidOffset: 8 });
  addOrder({ num: 6, userId: "usr_ria", event: ev("rock-revolution"), customer: cus.ria, catName: "Premium", qty: 1, seats: ["E2"], method: "credit_card", status: "paid", createdOffset: 35, paidOffset: 35, checkinOffset: 3, checkinBy: "usr_staff" });
  addOrder({ num: 7, userId: "usr_bayu", event: ev("coldplay-live-jakarta"), customer: cus.bayu, catName: "Premium", qty: 2, seats: ["E7", "E8"], method: "bank_transfer", status: "paid", createdOffset: 60, paidOffset: 60 });
  addOrder({ num: 8, userId: "usr_bayu", event: ev("soundwave-festival-2026"), customer: cus.bayu, catName: "VIP", qty: 1, method: "ewallet", status: "paid", createdOffset: 12, paidOffset: 12 });
  addOrder({ num: 9, userId: "usr_putri", event: ev("star-kids-world-tour"), customer: cus.putri, catName: "Festival", qty: 2, method: "qris", status: "paid", createdOffset: 10, paidOffset: 10 });
  addOrder({ num: 10, userId: "usr_putri", event: ev("niki-moonchild-tour"), customer: cus.putri, catName: "Premium", qty: 1, seats: ["F3"], method: "virtual_account", status: "paid", createdOffset: 20, paidOffset: 20 });
  addOrder({ num: 11, userId: "usr_dimas", event: ev("neon-odeon-nights"), customer: cus.dimas, catName: "Festival", qty: 3, method: "credit_card", status: "paid", createdOffset: 6, paidOffset: 6 });
  addOrder({ num: 12, userId: "usr_dimas", event: ev("indie-night"), customer: cus.dimas, catName: "VIP", qty: 1, method: "qris", status: "paid", createdOffset: 9, paidOffset: 9 });
  addOrder({ num: 13, userId: "usr_demo", event: ev("edm-universe"), customer: cus.demo, catName: "Regular", qty: 1, method: "qris", status: "pending", createdOffset: 0 });
  addOrder({ num: 14, userId: "usr_ria", event: ev("java-music-fest"), customer: cus.ria, catName: "Regular", qty: 2, method: "bank_transfer", status: "pending", createdOffset: 0 });
  addOrder({ num: 15, userId: "usr_bayu", event: ev("dewa19-30-years-rockestra"), customer: cus.bayu, catName: "Regular", qty: 2, method: "virtual_account", status: "cancelled", createdOffset: 5 });
  addOrder({ num: 16, userId: "usr_demo", event: ev("hip-hop-takeover"), customer: cus.demo, catName: "Regular", qty: 1, method: "ewallet", status: "refunded", createdOffset: 30, paidOffset: 29 });

  return { orders, tickets, payments, checkins };
}

function createDefaultDB(): DBShape {
  const built = buildSeedOrders();
  const notifications: AppNotification[] = [
    {
      id: "ntf_1",
      userId: "usr_demo",
      title: "Pembayaran Berhasil",
      message: "Tiket Soundwave Festival 2026 kamu sudah aktif. Jangan lupa bawa e-ticket!",
      type: "success",
      read: false,
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
    {
      id: "ntf_2",
      userId: "usr_demo",
      title: "Event Reminder",
      message: "Rock Revolution akan dimulai besok pukul 19:00 WIB di Gelora Bung Karno.",
      type: "info",
      read: false,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: "ntf_3",
      userId: "usr_demo",
      title: "Tiket Hampir Habis",
      message: "VIP Tulus Harmoni tersisa 40 tiket. Segera checkout sebelum kehabisan!",
      type: "warning",
      read: true,
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
  ];
  return {
    version: SEED_VERSION,
    users: seedUsers,
    artists: seedArtists,
    venues: seedVenues,
    events: seedEvents,
    promos: seedPromos,
    orders: built.orders,
    tickets: built.tickets,
    payments: built.payments,
    checkins: built.checkins,
    favorites: [
      { userId: "usr_demo", eventId: "ev_coldplay", createdAt: new Date().toISOString() },
      { userId: "usr_demo", eventId: "ev_edmuniverse", createdAt: new Date().toISOString() },
    ],
    notifications,
  };
}

function readDB(): DBShape {
  if (typeof window === "undefined") {
    return createDefaultDB();
  }
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DBShape;
      if (parsed.version === SEED_VERSION) {
        return parsed;
      }
    }
  } catch {
    /* corrupted -> reseed */
  }
  const fresh = createDefaultDB();
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(fresh));
  } catch {
    /* ignore quota */
  }
  return fresh;
}

function getDB(): DBShape {
  if (!cached) cached = readDB();
  return cached;
}

function notify() {
  listeners.forEach((fn) => fn());
}

export function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getSnapshot() {
  return getDB();
}

export function getDBValue(): DBShape {
  return getDB();
}

export function useDB(): DBShape {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function persist() {
  cached = null;
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(DB_KEY, JSON.stringify(getDB()));
    }
  } catch {
    /* ignore */
  }
  notify();
}

export function mutate<T>(fn: (db: DBShape) => T): T {
  const db = getDB();
  const result = fn(db);
  persist();
  return result;
}

export function resetDB() {
  cached = null;
  try {
    localStorage.removeItem(DB_KEY);
  } catch {
    /* ignore */
  }
  cached = getDB();
  persist();
}
