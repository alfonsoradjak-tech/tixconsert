"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useParams, useRouter, notFound } from "next/navigation";
import {
  Minus,
  Plus,
  Check,
  Calendar,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Stepper } from "@/components/ui/stepper";
import { useDB } from "@/lib/db";
import { getEventById, artistOf, venueOf } from "@/lib/services/event.service";
import { useBookingStore } from "@/lib/store/booking-store";
import { formatIDR, formatDate, cn } from "@/lib/utils";

export default function BuyTicketsPage() {
  useDB();
  const params = useParams();
  const router = useRouter();
  const eventId = String(params.eventId);
  const event = getEventById(eventId);

  const {
    items,
    eventId: bookingEventId,
    startBooking,
    addCategory,
    setQty,
    removeCategory,
  } = useBookingStore();

  useEffect(() => {
    if (bookingEventId !== eventId) {
      startBooking(eventId);
    }
  }, [bookingEventId, eventId, startBooking]);

  if (!event) notFound();

  const artist = artistOf(event);
  const venue = venueOf(event);
  const qtyFor = (catId: string) =>
    items.find((i) => i.ticketCategoryId === catId)?.qty ?? 0;
  const subtotal = items.reduce((sum, i) => {
    const cat = event.ticketCategories.find((c) => c.id === i.ticketCategoryId);
    return sum + (cat ? cat.price * i.qty : 0);
  }, 0);
  const serviceFee = Math.round(subtotal * 0.05);
  const total = subtotal + serviceFee;

  const hasSeatedSelection = items.some((i) => {
    const cat = event.ticketCategories.find((c) => c.id === i.ticketCategoryId);
    return cat?.isSeated && i.qty > 0;
  });

  const continueTo = () => {
    if (items.length === 0 || subtotal === 0) return;
    if (event.hasSeatLayout && hasSeatedSelection) {
      router.push(`/buy/seats/${eventId}`);
    } else {
      router.push("/buy/checkout");
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Stepper
          current={0}
          steps={[
            { label: "Select Ticket" },
            { label: "Select Seat" },
            { label: "Checkout" },
            { label: "Payment" },
          ]}
        />
      </div>

      <div className="mb-6 flex gap-4">
        <div className="relative h-28 w-20 shrink-0 overflow-hidden rounded-xl border border-border">
          <Image
            src={event.poster}
            alt={event.title}
            fill
            sizes="80px"
            className="object-cover"
          />
        </div>
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-black tracking-tight sm:text-3xl">
            {event.title}
          </h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-brand-400" /> {event.date}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-brand-400" /> {venue?.name},{" "}
              {venue?.city}
            </span>
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          {event.ticketCategories.map((cat) => {
            const remaining = Math.max(0, cat.quantity - cat.sold);
            const qty = qtyFor(cat.id);
            const soldOut = remaining === 0;
            return (
              <Card
                key={cat.id}
                className={cn(
                  "p-5 transition-all",
                  qty > 0 && "border-brand-500/60 ring-2 ring-brand-500/20",
                  soldOut && "opacity-60"
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-lg font-black">
                        {cat.name}
                      </h3>
                      {qty > 0 && (
                        <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-400">
                          <Check className="h-3 w-3" /> Selected
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 font-display text-2xl font-black text-brand-300">
                      {formatIDR(cat.price)}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {remaining} tiket tersisa · {cat.sold} terjual
                    </p>
                  </div>
                  {!soldOut && (
                    <div className="flex items-center gap-2 rounded-xl border border-border bg-surface p-1">
                      <button
                        onClick={() =>
                          qty <= 1 ? removeCategory(cat.id) : setQty(cat.id, qty - 1)
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-2 text-foreground transition-colors hover:bg-brand-500/20"
                        aria-label="Decrease"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center font-display text-lg font-black">
                        {qty}
                      </span>
                      <button
                        onClick={() => {
                          if (qty < remaining) addCategory(cat.id, 1);
                        }}
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-brand text-white transition-all",
                          qty >= remaining
                            ? "opacity-40 cursor-not-allowed"
                            : "hover:brightness-110"
                        )}
                        aria-label="Increase"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {cat.benefits.length > 0 && (
                  <div className="mt-4 grid gap-1.5 sm:grid-cols-2">
                    {cat.benefits.map((b) => (
                      <p
                        key={b}
                        className="flex items-center gap-2 text-xs text-muted"
                      >
                        <Check className="h-3.5 w-3.5 shrink-0 text-brand-400" />
                        {b}
                      </p>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}

          {event.hasSeatLayout && (
            <Card className="flex items-center gap-3 border-brand-500/30 bg-brand-500/5 p-4 text-sm text-muted">
              <MapPin className="h-5 w-5 shrink-0 text-brand-400" />
              Event ini menggunakan seat numbering. Kamu akan memilih kursi
              setelah memilih tiket.
            </Card>
          )}
        </div>

        <div>
          <div className="lg:sticky lg:top-24">
            <Card className="p-5">
              <h3 className="font-display text-lg font-black">Order Summary</h3>
              <div className="mt-4 space-y-2.5 text-sm">
                {items.length === 0 && (
                  <p className="text-muted">Belum ada tiket dipilih.</p>
                )}
                {items.map((i) => {
                  const cat = event.ticketCategories.find(
                    (c) => c.id === i.ticketCategoryId
                  );
                  return (
                    <div
                      key={i.ticketCategoryId}
                      className="flex items-center justify-between"
                    >
                      <span className="text-muted">
                        {cat?.name} × {i.qty}
                      </span>
                      <span className="font-semibold">
                        {formatIDR((cat?.price ?? 0) * i.qty)}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 space-y-2 border-t border-border pt-3 text-sm">
                <div className="flex justify-between text-muted">
                  <span>Subtotal</span>
                  <span>{formatIDR(subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Service Fee (5%)</span>
                  <span>{formatIDR(serviceFee)}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2 font-display text-base font-black">
                  <span>Total</span>
                  <span className="text-brand-300">{formatIDR(total)}</span>
                </div>
              </div>
              <Button
                className="mt-5 w-full"
                size="xl"
                disabled={subtotal === 0}
                onClick={continueTo}
              >
                Continue to Checkout
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
