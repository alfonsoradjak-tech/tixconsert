"use client";

import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import { Ticket as TicketIcon, Download, Printer, CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  artistOf,
  venueOf,
  getEventById,
} from "@/lib/services/event.service";
import { getTicketById } from "@/lib/services/order.service";
import { useDB } from "@/lib/db";
import {
  formatDate,
  formatIDR,
  downloadFile,
  generateICS,
} from "@/lib/utils";
import { toast } from "sonner";
import type { Ticket } from "@/lib/types";

export function ETicket({
  ticket,
  buyerName,
}: {
  ticket: Ticket;
  buyerName: string;
}) {
  useDB();
  const event = getEventById(ticket.eventId);
  if (!event) return null;
  const artist = artistOf(event);
  const venue = venueOf(event);
  const payload = ticket.qr;

  const onDownload = () => {
    window.print();
    toast.success("Gunakan opsi 'Save as PDF' pada dialog print untuk mengunduh e-ticket.");
  };

  const onCalendar = () => {
    if (!venue) return;
    const ics = generateICS({
      title: event.title,
      date: event.date,
      time: event.time,
      venue: venue.name,
      address: venue.address,
    });
    downloadFile(ics, `${event.slug}-reminder.ics`, "text/calendar");
    toast.success("Event ditambahkan ke kalender");
  };

  return (
    <div id="print-area" className="w-full max-w-md">
      <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-xl">
        <div className="relative h-36 w-full">
          <Image
            src={event.poster}
            alt={event.title}
            fill
            sizes="448px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
            <span className="flex items-center gap-1.5 text-sm font-black text-white">
              <TicketIcon className="h-4 w-4" /> TIXCONCERT
            </span>
            <span className="rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
              E-Ticket
            </span>
          </div>
          <div className="absolute inset-x-0 bottom-0 p-4">
            <p className="font-display text-lg font-black text-white">
              {event.title}
            </p>
            <p className="text-xs text-white/70">{artist?.name}</p>
          </div>
        </div>

        <div className="relative p-5">
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted">Ticket Holder</p>
              <p className="font-semibold">{buyerName}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted">Ticket Type</p>
              <p className="font-semibold text-brand-300">{ticket.ticketType}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted">Date</p>
              <p className="font-semibold">{formatDate(event.date)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted">Time</p>
              <p className="font-semibold">{event.time} WIB</p>
            </div>
            <div className="col-span-2">
              <p className="text-[10px] uppercase tracking-wide text-muted">Venue</p>
              <p className="font-semibold">
                {venue?.name}, {venue?.city}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted">Seat</p>
              <p className="font-semibold">{ticket.seat || "Free Standing"}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted">Order ID</p>
              <p className="font-semibold">{ticket.orderId}</p>
            </div>
          </div>

          <div className="card-dashed-edge my-5 border-y border-dashed border-border py-5">
            <div className="flex items-center justify-center">
              <QRCodeSVG
                value={payload}
                size={168}
                level="M"
                fgColor="#120e20"
                bgColor="#ffffff"
                className="rounded-xl border border-border bg-white p-2"
              />
            </div>
            <p className="mt-3 text-center text-[10px] uppercase tracking-widest text-muted">
              Scan QR ini untuk check-in
            </p>
          </div>

          <div className="flex items-center justify-between text-xs text-muted">
            <span>Total</span>
            <span className="font-display text-base font-black text-foreground">
              {formatIDR(ticket.price)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 print:hidden">
        <Button variant="secondary" size="sm" onClick={onDownload}>
          <Download className="h-4 w-4" /> Download
        </Button>
        <Button variant="secondary" size="sm" onClick={() => window.print()}>
          <Printer className="h-4 w-4" /> Print
        </Button>
        <Button variant="secondary" size="sm" onClick={onCalendar}>
          <CalendarPlus className="h-4 w-4" /> Calendar
        </Button>
      </div>
    </div>
  );
}
