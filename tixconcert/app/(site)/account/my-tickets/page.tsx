"use client";

import { useState } from "react";
import Image from "next/image";
import { Calendar, MapPin, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { ETicket } from "@/components/ticket/e-ticket";
import { useDB } from "@/lib/db";
import { getUserTickets } from "@/lib/services/order.service";
import { getEventById, venueOf } from "@/lib/services/event.service";
import { useAuthStore } from "@/lib/store/auth-store";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Ticket } from "@/lib/types";

function statusInfo(status: Ticket["status"]) {
  switch (status) {
    case "paid":
      return { label: "Active", variant: "success" as const };
    case "used":
      return { label: "Used", variant: "info" as const };
    case "pending":
      return { label: "Pending", variant: "warning" as const };
    case "cancelled":
      return { label: "Cancelled", variant: "neutral" as const };
    case "refunded":
      return { label: "Refunded", variant: "neutral" as const };
  }
}

function TicketRow({ ticket, buyerName }: { ticket: Ticket; buyerName: string }) {
  useDB();
  const [open, setOpen] = useState(false);
  const event = getEventById(ticket.eventId);
  if (!event) return null;
  const venue = venueOf(event);
  const info = statusInfo(ticket.status);

  return (
    <Card className="overflow-hidden transition-all hover:border-brand-500/40">
      <div className="flex">
        <div className="relative hidden h-auto w-28 shrink-0 sm:block">
          <Image
            src={event.poster}
            alt={event.title}
            fill
            sizes="112px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card/40" />
        </div>
        <div className="flex flex-1 flex-col gap-3 p-4 sm:flex-row sm:items-center sm:p-5">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-sm font-black sm:text-base">
                {event.title}
              </h3>
              <Badge variant={info.variant}>{info.label}</Badge>
            </div>
            <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-brand-400" />
                {formatDate(event.date)}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-brand-400" />
                {venue?.city}
              </span>
              <span className="flex items-center gap-1.5 text-brand-300">
                <QrCode className="h-3.5 w-3.5" />
                {ticket.ticketType}
                {ticket.seat ? ` · Seat ${ticket.seat}` : ""}
              </span>
            </div>
          </div>
          {ticket.status === "paid" && (
            <Button
              size="sm"
              onClick={() => setOpen(true)}
              className="shrink-0"
            >
              <QrCode className="h-4 w-4" /> View E-Ticket
            </Button>
          )}
        </div>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="E-Ticket"
        maxWidth="max-w-md"
      >
        <div className="flex justify-center">
          <ETicket ticket={ticket} buyerName={buyerName} />
        </div>
      </Modal>
    </Card>
  );
}

export default function MyTicketsPage() {
  useDB();
  const session = useAuthStore((s) => s.session);
  const [tab, setTab] = useState("upcoming");

  if (!session) return null;
  const tickets = getUserTickets(session.id);
  const today = new Date().toISOString().slice(0, 10);

  const upcoming = tickets.filter(
    (t) => (getEventById(t.eventId)?.date ?? "") >= today && t.status === "paid"
  );
  const past = tickets.filter(
    (t) => (getEventById(t.eventId)?.date ?? "") < today || t.status === "used"
  );
  const cancelled = tickets.filter(
    (t) => t.status === "cancelled" || t.status === "refunded" || t.status === "pending"
  );

  const list =
    tab === "upcoming" ? upcoming : tab === "past" ? past : cancelled;

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div className="flex gap-1 rounded-xl bg-surface-2 p-1">
          {[
            { key: "upcoming", label: "Upcoming", count: upcoming.length },
            { key: "past", label: "Past", count: past.length },
            { key: "cancelled", label: "Cancelled", count: cancelled.length },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-semibold transition-all",
                tab === t.key
                  ? "bg-surface text-foreground shadow-sm"
                  : "text-muted hover:text-foreground"
              )}
            >
              {t.label} <span className="text-xs opacity-60">({t.count})</span>
            </button>
          ))}
        </div>
      </div>

      {list.length > 0 ? (
        <div className="space-y-3">
          {list.map((t) => (
            <TicketRow key={t.id} ticket={t} buyerName={session.name} />
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-brand-soft border border-brand-500/20">
            <QrCode className="h-8 w-8 text-brand-400" />
          </div>
          <h3 className="mt-4 font-display text-lg font-black">No tickets yet</h3>
          <p className="mt-1.5 text-sm text-muted">
            Your purchased tickets will appear here.
          </p>
          <Button href="/concerts" className="mt-6">
            Explore Concerts
          </Button>
        </Card>
      )}
    </div>
  );
}
