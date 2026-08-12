"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useParams, useRouter, notFound } from "next/navigation";
import { ChevronLeft, ArrowRight, Armchair } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Stepper } from "@/components/ui/stepper";
import { useDB } from "@/lib/db";
import { getEventById, venueOf } from "@/lib/services/event.service";
import { buildSeats } from "@/lib/services/seat.service";
import { useBookingStore } from "@/lib/store/booking-store";
import { formatIDR, cn } from "@/lib/utils";

export default function BuySeatsPage() {
  useDB();
  const params = useParams();
  const router = useRouter();
  const eventId = String(params.eventId);
  const event = getEventById(eventId);

  const items = useBookingStore((s) => s.items);
  const setSeats = useBookingStore((s) => s.setSeats);

  const seats = useMemo(
    () => (event ? buildSeats(event) : []),
    [event]
  );

  const seatedItems = items.filter((i) => {
    const cat = event?.ticketCategories.find((c) => c.id === i.ticketCategoryId);
    return cat?.isSeated && i.qty > 0;
  });
  const maxSeats = seatedItems.reduce((s, i) => s + i.qty, 0);

  const [selected, setSelected] = useState<string[]>(() => {
    return seatedItems.flatMap((i) => i.seats);
  });

  useEffect(() => {
    if (!event) return;
    if (!event.hasSeatLayout) router.replace("/buy/checkout");
  }, [event, router]);

  if (!event) notFound();

  const venue = venueOf(event);

  const toggle = (label: string, status: string) => {
    if (status !== "available") return;
    setSelected((prev) => {
      if (prev.includes(label)) return prev.filter((s) => s !== label);
      if (prev.length >= maxSeats) return prev;
      return [...prev, label];
    });
  };

  const syncAndContinue = () => {
    let remaining = [...selected];
    for (const item of seatedItems) {
      const take = remaining.slice(0, item.qty);
      remaining = remaining.slice(item.qty);
      setSeats(item.ticketCategoryId, take);
    }
    router.push("/buy/checkout");
  };

  const priceOf = (label: string) =>
    seats.find((s) => s.label === label)?.price ?? 0;
  const selectedTotal = selected.reduce((s, l) => s + priceOf(l), 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Stepper
          current={1}
          steps={[
            { label: "Select Ticket", done: true },
            { label: "Select Seat" },
            { label: "Checkout" },
            { label: "Payment" },
          ]}
        />
      </div>

      <div className="mb-6 flex items-center gap-4">
        <div className="relative h-24 w-18 shrink-0 overflow-hidden rounded-xl border border-border">
          <Image
            src={event.poster}
            alt={event.title}
            fill
            sizes="72px"
            className="object-cover"
          />
        </div>
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-black tracking-tight">
            {event.title}
          </h1>
          <p className="text-sm text-muted">
            {venue?.name}, {venue?.city} · Pilih kursi yang tersedia
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <Card className="overflow-hidden">
            <div className="flex items-center justify-center bg-gradient-brand py-3 text-sm font-black uppercase tracking-widest text-white">
              <Armchair className="mr-2 h-5 w-5" /> Stage
            </div>
            <div className="overflow-x-auto p-4">
              <div className="min-w-[680px]">
                {event.seatMap?.sections.map((section) => {
                  const sectionSeats = seats.filter(
                    (s) => s.sectionId === section.id
                  );
                  const rows = Array.from(
                    new Set(sectionSeats.map((s) => s.row))
                  );
                  return (
                    <div key={section.id} className="mb-6">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-xs font-black uppercase tracking-widest text-muted">
                          {section.name} Area
                        </p>
                        <p className="text-[10px] text-muted">
                          {section.cols} seats / row
                        </p>
                      </div>
                      <div className="rounded-xl border border-border bg-surface-2/50 p-3">
                        <div className="space-y-1.5">
                          {rows.map((row) => (
                            <div key={row} className="flex items-center gap-1">
                              <span className="w-4 shrink-0 text-center text-[10px] font-bold text-muted">
                                {row}
                              </span>
                              <div className="flex flex-1 flex-wrap gap-1">
                                {sectionSeats
                                  .filter((s) => s.row === row)
                                  .map((seat) => {
                                    const isSelected = selected.includes(
                                      seat.label
                                    );
                                    return (
                                      <button
                                        key={seat.id}
                                        onClick={() =>
                                          toggle(seat.label, seat.status)
                                        }
                                        disabled={seat.status !== "available"}
                                        title={`${seat.label} - ${
                                          seat.status
                                        } - ${formatIDR(seat.price)}`}
                                        className={cn(
                                          "h-6 w-6 rounded-md text-[9px] font-bold transition-all",
                                          isSelected
                                            ? "bg-gradient-brand text-white scale-110 shadow-lg shadow-brand-600/40"
                                            : seat.status === "sold"
                                              ? "bg-border text-muted/50 cursor-not-allowed"
                                              : seat.status === "reserved"
                                                ? "bg-amber-500/30 text-amber-300/60 cursor-not-allowed"
                                                : "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/40"
                                        )}
                                      >
                                        {seat.number}
                                      </button>
                                    );
                                  })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs text-muted">
                  <span className="flex items-center gap-1.5">
                    <span className="h-4 w-4 rounded bg-emerald-500/20" /> Available
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-4 w-4 rounded bg-gradient-brand" /> Selected
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-4 w-4 rounded bg-border" /> Sold
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-4 w-4 rounded bg-amber-500/30" /> Reserved
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div>
          <div className="lg:sticky lg:top-24">
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-black">Your Seats</h3>
                <span className="rounded-full bg-brand-500/10 px-2.5 py-1 text-xs font-bold text-brand-300">
                  {selected.length} / {maxSeats}
                </span>
              </div>

              <div className="mt-4 min-h-24 rounded-xl border border-border bg-surface-2/50 p-3">
                {selected.length === 0 ? (
                  <p className="text-center text-xs text-muted">
                    Belum ada kursi dipilih. Pilih hingga {maxSeats} kursi.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {selected.map((s) => (
                      <span
                        key={s}
                        className="rounded-lg bg-gradient-brand px-2 py-1 text-xs font-bold text-white"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 space-y-2 text-sm">
                {selected.map((s) => (
                  <div
                    key={s}
                    className="flex items-center justify-between text-muted"
                  >
                    <span>Seat {s}</span>
                    <span className="font-semibold text-foreground">
                      {formatIDR(priceOf(s))}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-between border-t border-border pt-3 font-display text-base font-black">
                <span>Total</span>
                <span className="text-brand-300">{formatIDR(selectedTotal)}</span>
              </div>

              <Button
                className="mt-5 w-full"
                size="xl"
                disabled={selected.length !== maxSeats}
                onClick={syncAndContinue}
              >
                Continue to Checkout
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                className="mt-2 w-full"
                onClick={() => router.push(`/buy/tickets/${eventId}`)}
              >
                <ChevronLeft className="h-4 w-4" /> Back to Tickets
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
