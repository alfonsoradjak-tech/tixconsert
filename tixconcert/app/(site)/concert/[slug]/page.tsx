"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter, notFound } from "next/navigation";
import {
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
  Heart,
  Share2,
  Bell,
  ShieldCheck,
  Music2,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { badgeVariant } from "@/components/concert/event-card";
import { EventCard } from "@/components/concert/event-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useDB } from "@/lib/db";
import {
  getEventBySlug,
  artistOf,
  venueOf,
  relatedEvents,
  eventAvailability,
  eventRemaining,
  eventTotalSold,
  eventLowestPrice,
} from "@/lib/services/event.service";
import { isFavorite, toggleFavorite } from "@/lib/services/favorite.service";
import { useAuthStore } from "@/lib/store/auth-store";
import { formatIDR, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const eventRules = [
  "Tiket wajib ditunjukkan pada pintu masuk (digital atau cetak).",
  "Satu tiket berlaku untuk satu orang (one ticket one person).",
  "Pintu masuk dibuka 2 jam sebelum konser dimulai.",
  "Dilarang membawa kamera profesional, rekaman video, dan laser pointer.",
  "Panitia berhak menolak masuk pengunjung yang membawa barang terlarang.",
  "Pengunjung diwajibkan menjaga ketertiban dan keamanan selama acara.",
];

export default function ConcertDetailPage() {
  useDB();
  const params = useParams();
  const router = useRouter();
  const slug = Array.isArray(params.slug) ? params.slug[0] : (params.slug ?? "");
  const event = getEventBySlug(slug);

  const session = useAuthStore((s) => s.session);
  const [copied, setCopied] = useState(false);

  if (!event) notFound();

  const artist = artistOf(event);
  const venue = venueOf(event);
  const availability = eventAvailability(event);
  const related = relatedEvents(event, 4);
  const fav = isFavorite(session?.id ?? "", event.id);
  const soldOut = availability === "sold_out";

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Link konser disalin");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Gagal menyalin link");
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-muted">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/concerts" className="hover:text-foreground">Concerts</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="font-semibold text-foreground">{event.title}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {event.badges.map((b) => (
              <Badge key={b} variant={badgeVariant(b)}>
                {b === "best_seller" ? "Best Seller" : b}
              </Badge>
            ))}
            <Badge variant="neutral">{event.category}</Badge>
          </div>

          <h1 className="mt-3 font-display text-3xl font-black tracking-tight sm:text-5xl">
            {event.title}
          </h1>
          <p className="mt-2 flex items-center gap-2 text-base font-semibold text-muted">
            <Music2 className="h-5 w-5 text-brand-400" /> {artist?.name}
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Card className="flex items-center gap-3 p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-300">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted">Date</p>
                <p className="text-sm font-bold">{formatDate(event.date)}</p>
              </div>
            </Card>
            <Card className="flex items-center gap-3 p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-300">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted">Time</p>
                <p className="text-sm font-bold">{event.time} WIB</p>
              </div>
            </Card>
            <Card className="flex items-center gap-3 p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-300">
                <MapPin className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-wide text-muted">Location</p>
                <p className="truncate text-sm font-bold">{venue?.name}</p>
              </div>
            </Card>
          </div>

          <div className="mt-8">
            <h2 className="font-display text-xl font-black">About Event</h2>
            <p className="mt-3 leading-relaxed text-muted">
              {event.longDescription}
            </p>
          </div>

          <div className="mt-8">
            <h2 className="font-display text-xl font-black">Venue Information</h2>
            <Card className="mt-3 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-300">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold">{venue?.name}</p>
                  <p className="mt-0.5 text-sm text-muted">
                    {venue?.address}, {venue?.city}
                  </p>
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-muted">
                    <Users className="h-4 w-4 text-brand-400" />
                    Kapasitas {venue?.capacity.toLocaleString("id-ID")} orang
                  </p>
                  <p className="mt-2 text-sm text-muted">{venue?.description}</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="mt-8">
            <h2 className="font-display text-xl font-black">Ticket Categories</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {event.ticketCategories.map((c) => {
                const remaining = Math.max(0, c.quantity - c.sold);
                return (
                  <Card
                    key={c.id}
                    className={cn(
                      "p-4 transition-all",
                      remaining === 0 && "opacity-60"
                    )}
                  >
                    <p className="font-display font-bold">{c.name}</p>
                    <p className="mt-1 font-display text-lg font-black text-brand-300">
                      {formatIDR(c.price)}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-xs text-muted">
                      <span>{remaining} tersisa</span>
                      <span>{c.sold} terjual</span>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          <div className="mt-8">
            <h2 className="font-display text-xl font-black">Event Rules</h2>
            <Card className="mt-3 p-5">
              <ul className="space-y-2.5">
                {eventRules.map((rule, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-muted">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
                    {rule}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>

        <div>
          <div className="lg:sticky lg:top-24 space-y-4">
            <div className="overflow-hidden rounded-3xl border border-border">
              <div className="relative aspect-[3/4]">
                <Image
                  src={event.poster}
                  alt={event.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 420px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-white/60">
                      Start from
                    </p>
                    <p className="font-display text-2xl font-black text-white">
                      {formatIDR(eventLowestPrice(event))}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-bold",
                      availability === "sold_out"
                        ? "bg-red-500 text-white"
                        : availability === "low"
                          ? "bg-amber-500 text-white"
                          : "bg-emerald-500 text-white"
                    )}
                  >
                    {availability === "sold_out"
                      ? "SOLD OUT"
                      : availability === "low"
                        ? "LOW STOCK"
                        : "AVAILABLE"}
                  </span>
                </div>
              </div>
            </div>

            <Card className="p-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Total tickets sold</span>
                <span className="font-bold">
                  {eventTotalSold(event).toLocaleString("id-ID")}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-muted">Remaining tickets</span>
                <span
                  className={cn(
                    "font-bold",
                    eventRemaining(event) > 0 ? "text-emerald-400" : "text-red-400"
                  )}
                >
                  {eventRemaining(event).toLocaleString("id-ID")}
                </span>
              </div>

              <div className="mt-4">
                {soldOut ? (
                  <Button
                    className="w-full"
                    variant="secondary"
                    disabled
                  >
                    Sold Out
                  </Button>
                ) : (
                  <Button
                    className="w-full animate-glow"
                    size="xl"
                    onClick={() => router.push(`/buy/tickets/${event.id}`)}
                  >
                    BUY TICKET
                  </Button>
                )}
              </div>

              <div className="mt-3 flex gap-2">
                <Button
                  variant="secondary"
                  className={cn("flex-1", fav && "border-rose-500/40 text-rose-400")}
                  onClick={() => {
                    if (!session) {
                      toast.error("Login dulu untuk menyimpan favorit");
                      return;
                    }
                    const added = toggleFavorite(session.id, event.id);
                    toast[added ? "success" : "info"](
                      added ? "Ditambahkan ke favorit" : "Dihapus dari favorit"
                    );
                  }}
                >
                  <Heart className={cn("h-4 w-4", fav && "fill-current")} />
                  {fav ? "Saved" : "Save"}
                </Button>
                <Button variant="secondary" className="flex-1" onClick={share}>
                  <Share2 className="h-4 w-4" />
                  {copied ? "Copied" : "Share"}
                </Button>
              </div>

              {soldOut && (
                <Button
                  variant="subtle"
                  className="mt-3 w-full"
                  onClick={() => toast.info("Kamu akan diberi tahu saat tiket kembali tersedia.")}
                >
                  <Bell className="h-4 w-4" /> Notify Me
                </Button>
              )}
            </Card>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 font-display text-2xl font-black tracking-tight">
            You May Also Like
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {related.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
