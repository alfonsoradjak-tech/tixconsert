"use client";

import { useState } from "react";
import { Search, Ticket as TicketIcon, Download } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useDB } from "@/lib/db";
import { getEventById } from "@/lib/services/event.service";
import { exportCSV, formatIDR } from "@/lib/utils";
import type { Ticket, TicketStatus } from "@/lib/types";

function statusVariant(s: TicketStatus) {
  switch (s) {
    case "paid":
      return "success" as const;
    case "pending":
      return "warning" as const;
    case "cancelled":
      return "neutral" as const;
    case "used":
      return "info" as const;
    case "refunded":
      return "danger" as const;
  }
}

export default function AdminTicketsPage() {
  useDB();
  const db = useDB();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const tickets = db.tickets
    .filter((t) => {
      const order = db.orders.find((o) => o.id === t.orderId);
      const event = getEventById(t.eventId);
      const customer = db.users.find((u) => u.id === t.userId);
      const matchQ =
        !query ||
        t.orderId.toLowerCase().includes(query.toLowerCase()) ||
        t.id.toLowerCase().includes(query.toLowerCase()) ||
        (event?.title.toLowerCase().includes(query.toLowerCase()) ?? false) ||
        (customer?.name.toLowerCase().includes(query.toLowerCase()) ?? false);
      const matchS = status === "all" || t.status === status;
      return matchQ && matchS;
    })
    .sort((a, b) => b.orderId.localeCompare(a.orderId));

  const exportData = () => {
    exportCSV(
      tickets.map((t) => {
        const order = db.orders.find((o) => o.id === t.orderId);
        const event = getEventById(t.eventId);
        const customer = db.users.find((u) => u.id === t.userId);
        return {
          "Ticket ID": t.id,
          "Order ID": t.orderId,
          Customer: customer?.name ?? "",
          Event: event?.title ?? "",
          "Ticket Type": t.ticketType,
          Seat: t.seat ?? "",
          Price: t.price,
          "Payment Status": order?.status ?? "",
          "Ticket Status": t.status,
        };
      }),
      "tickets-export.csv"
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-black tracking-tight">Manage Tickets</h2>
          <p className="text-sm text-muted">{db.tickets.length} total tiket</p>
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
            placeholder="Search by ticket ID, order, event, customer..."
            className="pl-10"
          />
        </div>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-44">
          <option value="all">All Status</option>
          {["paid", "pending", "used", "cancelled", "refunded"].map((s) => (
            <option key={s} value={s}>{s.toUpperCase()}</option>
          ))}
        </Select>
      </div>

      {tickets.length > 0 ? (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-2/50 text-left text-xs uppercase tracking-wide text-muted">
                  <th className="px-4 py-3">Ticket ID</th>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Event</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Seat</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => {
                  const order = db.orders.find((o) => o.id === t.orderId);
                  const event = getEventById(t.eventId);
                  const customer = db.users.find((u) => u.id === t.userId);
                  return (
                    <tr key={t.id} className="border-b border-border/60 transition-colors hover:bg-surface-2/40">
                      <td className="px-4 py-3 font-mono text-xs">{t.id.slice(0, 14)}...</td>
                      <td className="px-4 py-3 font-mono text-xs text-brand-300">{t.orderId}</td>
                      <td className="px-4 py-3">{customer?.name ?? "—"}</td>
                      <td className="px-4 py-3 max-w-40 truncate">{event?.title}</td>
                      <td className="px-4 py-3">{t.ticketType}</td>
                      <td className="px-4 py-3">{t.seat || "—"}</td>
                      <td className="px-4 py-3 font-semibold">{formatIDR(t.price)}</td>
                      <td className="px-4 py-3">
                        <Badge variant={statusVariant(t.status)}>{t.status}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card>
          <EmptyState
            icon={TicketIcon}
            title="No tickets found"
            description="Tidak ada tiket yang cocok dengan filter ini."
          />
        </Card>
      )}
    </div>
  );
}
