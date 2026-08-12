"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Search,
  ReceiptText,
  Download,
  ChevronDown,
  CheckCircle2,
  XCircle,
  RotateCcw,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useDB } from "@/lib/db";
import { getEventById, venueOf } from "@/lib/services/event.service";
import {
  confirmPayment,
  cancelOrder,
  refundOrder,
} from "@/lib/services/order.service";
import { exportCSV, formatIDR, cn } from "@/lib/utils";
import { toast } from "sonner";
import type { OrderStatus } from "@/lib/types";

function statusVariant(s: OrderStatus) {
  switch (s) {
    case "paid":
      return "success" as const;
    case "pending":
      return "warning" as const;
    case "cancelled":
      return "neutral" as const;
    case "refunded":
      return "danger" as const;
    case "expired":
      return "danger" as const;
  }
}

export default function AdminOrdersPage() {
  useDB();
  const db = useDB();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const orders = db.orders
    .filter((o) => {
      const event = getEventById(o.eventId);
      const customer = db.users.find((u) => u.id === o.userId);
      const matchQ =
        !query ||
        o.orderId.toLowerCase().includes(query.toLowerCase()) ||
        (event?.title.toLowerCase().includes(query.toLowerCase()) ?? false) ||
        o.customerName.toLowerCase().includes(query.toLowerCase()) ||
        o.customerEmail.toLowerCase().includes(query.toLowerCase());
      const matchS = status === "all" || o.status === status;
      return matchQ && matchS;
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const exportData = () => {
    exportCSV(
      orders.map((o) => ({
        "Order ID": o.orderId,
        Customer: o.customerName,
        Email: o.customerEmail,
        Event: getEventById(o.eventId)?.title ?? "",
        Total: o.total,
        Method: o.paymentMethod,
        Status: o.status,
        Created: o.createdAt,
      })),
      "orders-export.csv"
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-black tracking-tight">Manage Orders</h2>
          <p className="text-sm text-muted">{db.orders.length} total transaksi</p>
        </div>
        <Button variant="secondary" size="sm" onClick={exportData}>
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-52">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search order, customer, event..."
            className="pl-10"
          />
        </div>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-40">
          <option value="all">All Status</option>
          {["paid", "pending", "cancelled", "refunded", "expired"].map((s) => (
            <option key={s} value={s}>{s.toUpperCase()}</option>
          ))}
        </Select>
      </div>

      {orders.length > 0 ? (
        <div className="space-y-3">
          {orders.map((o) => {
            const event = getEventById(o.eventId);
            const venue = event ? venueOf(event) : undefined;
            const open = openId === o.id;
            return (
              <Card key={o.id} className="overflow-hidden">
                <div className="flex flex-wrap items-center gap-3 p-4">
                  <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src={event?.poster ?? ""}
                      alt=""
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-display text-sm font-black">
                        {event?.title}
                      </p>
                      <Badge variant={statusVariant(o.status)}>{o.status}</Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-muted">
                      <span className="font-mono text-brand-300">{o.orderId}</span>{" "}
                      · {o.customerName} · {venue?.city}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-sm font-black text-brand-300">
                      {formatIDR(o.total)}
                    </p>
                    <p className="text-[10px] capitalize text-muted">
                      {o.paymentMethod.replace("_", " ")}
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    {o.status === "pending" && (
                      <Button
                        size="xs"
                        variant="secondary"
                        onClick={() => {
                          confirmPayment(o.id, "");
                          toast.success(`Order ${o.orderId} ditandai PAID`);
                        }}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Mark Paid
                      </Button>
                    )}
                    {o.status === "paid" && (
                      <Button
                        size="xs"
                        variant="danger"
                        onClick={() => {
                          const res = refundOrder(o.id);
                          res.ok
                            ? toast.success("Order di-refund")
                            : toast.error(res.error ?? "Gagal refund");
                        }}
                      >
                        <RotateCcw className="h-3.5 w-3.5" /> Refund
                      </Button>
                    )}
                    {o.status === "pending" && (
                      <Button
                        size="xs"
                        variant="danger"
                        onClick={() => {
                          cancelOrder(o.id);
                          toast.info("Order dibatalkan");
                        }}
                      >
                        <XCircle className="h-3.5 w-3.5" /> Cancel
                      </Button>
                    )}
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => setOpenId(open ? null : o.id)}
                    >
                      <ChevronDown
                        className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
                      />
                    </Button>
                  </div>
                </div>
                {open && (
                  <div className="grid gap-4 border-t border-border p-4 sm:grid-cols-2 animate-fade-in">
                    <div>
                      <p className="mb-2 text-[10px] uppercase tracking-widest text-muted">
                        Items
                      </p>
                      {o.items.map((i) => (
                        <p key={i.id} className="text-sm text-muted">
                          {i.ticketType} × {i.quantity}
                          {i.seats.length > 0 && ` · ${i.seats.join(", ")}`} —{" "}
                          <span className="font-semibold text-foreground">
                            {formatIDR(i.unitPrice * i.quantity)}
                          </span>
                        </p>
                      ))}
                    </div>
                    <div>
                      <p className="mb-2 text-[10px] uppercase tracking-widest text-muted">
                        Customer
                      </p>
                      <p className="text-sm">{o.customerName}</p>
                      <p className="text-sm text-muted">{o.customerEmail}</p>
                      <p className="text-sm text-muted">{o.customerPhone}</p>
                      <p className="mt-1 text-xs text-muted">
                        Dibuat: {new Date(o.createdAt).toLocaleString("id-ID")}
                      </p>
                      {o.discount > 0 && (
                        <p className="mt-1 text-xs text-emerald-400">
                          Promo {o.promoCode}: -{formatIDR(o.discount)}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <EmptyState
            icon={ReceiptText}
            title="No orders found"
            description="Tidak ada order yang cocok dengan filter."
          />
        </Card>
      )}
    </div>
  );
}
