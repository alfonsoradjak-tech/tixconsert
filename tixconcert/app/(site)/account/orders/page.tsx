"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown, ReceiptText, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuthStore } from "@/lib/store/auth-store";
import { useDB } from "@/lib/db";
import { getUserOrders } from "@/lib/services/order.service";
import { getEventById, venueOf } from "@/lib/services/event.service";
import { formatDate, formatIDR, cn } from "@/lib/utils";
import type { OrderStatus } from "@/lib/types";

function statusBadge(status: OrderStatus) {
  switch (status) {
    case "paid":
      return { label: "Paid", variant: "success" as const };
    case "pending":
      return { label: "Pending", variant: "warning" as const };
    case "cancelled":
      return { label: "Cancelled", variant: "neutral" as const };
    case "refunded":
      return { label: "Refunded", variant: "neutral" as const };
    case "expired":
      return { label: "Expired", variant: "danger" as const };
  }
}

export default function OrderHistoryPage() {
  useDB();
  const session = useAuthStore((s) => s.session);
  const [openId, setOpenId] = useState<string | null>(null);

  if (!session) return null;
  const orders = getUserOrders(session.id);

  return (
    <div>
      <h2 className="mb-5 font-display text-xl font-black">Order History</h2>

      {orders.length > 0 ? (
        <div className="space-y-3">
          {orders.map((o) => {
            const event = getEventById(o.eventId);
            const venue = event ? venueOf(event) : undefined;
            const badge = statusBadge(o.status);
            const open = openId === o.id;
            return (
              <Card key={o.id} className="overflow-hidden">
                <button
                  onClick={() => setOpenId(open ? null : o.id)}
                  className="flex w-full items-center gap-4 p-4 text-left sm:p-5"
                >
                  <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src={event?.poster ?? ""}
                      alt={event?.title ?? ""}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-display text-sm font-black">
                        {event?.title}
                      </p>
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-muted">
                      {o.orderId} · {formatDate(event?.date ?? "")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-sm font-black text-brand-300">
                      {formatIDR(o.total)}
                    </p>
                    <p className="text-[10px] text-muted capitalize">
                      {o.paymentMethod.replace("_", " ")}
                    </p>
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-muted transition-transform",
                      open && "rotate-180"
                    )}
                  />
                </button>

                {open && (
                  <div className="border-t border-border p-4 sm:p-5 animate-fade-in">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="mb-2 text-[10px] uppercase tracking-widest text-muted">
                          Order Items
                        </p>
                        <div className="space-y-1.5 text-sm">
                          {o.items.map((i) => (
                            <div key={i.id} className="flex justify-between text-muted">
                              <span>
                                {i.ticketType} × {i.quantity}
                                {i.seats.length > 0 &&
                                  ` · ${i.seats.join(", ")}`}
                              </span>
                              <span className="font-semibold text-foreground">
                                {formatIDR(i.unitPrice * i.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="mb-2 text-[10px] uppercase tracking-widest text-muted">
                          Payment Details
                        </p>
                        <div className="space-y-1 text-sm text-muted">
                          <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>{formatIDR(o.subtotal)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Service Fee</span>
                            <span>{formatIDR(o.serviceFee)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Payment Fee</span>
                            <span>{formatIDR(o.paymentFee)}</span>
                          </div>
                          {o.discount > 0 && (
                            <div className="flex justify-between text-emerald-400">
                              <span>Discount</span>
                              <span>-{formatIDR(o.discount)}</span>
                            </div>
                          )}
                          <div className="flex justify-between border-t border-border pt-1 font-bold text-foreground">
                            <span>Total</span>
                            <span>{formatIDR(o.total)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="mt-4 flex items-center gap-1.5 text-xs text-muted">
                      <MapPin className="h-3.5 w-3.5 text-brand-400" />
                      {venue?.name}, {venue?.city} ·{" "}
                      {new Date(o.createdAt).toLocaleString("id-ID")}
                    </p>
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
            title="No orders yet"
            description="Belum ada transaksi. Mulai beli tiket konser pertamamu."
            actionLabel="Explore Concerts"
            actionHref="/concerts"
          />
        </Card>
      )}
    </div>
  );
}
