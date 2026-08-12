"use client";

import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, MapPin, ArrowRight, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  artistOf,
  venueOf,
  eventLowestPrice,
  eventAvailability,
} from "@/lib/services/event.service";
import { formatIDR } from "@/lib/utils";
import { useAuthStore } from "@/lib/store/auth-store";
import { isFavorite, toggleFavorite } from "@/lib/services/favorite.service";
import { toast } from "sonner";
import { useDB } from "@/lib/db";
import type { ConcertEvent, EventBadge } from "@/lib/types";

export function badgeVariant(b: EventBadge) {
  switch (b) {
    case "hot":
      return "hot" as const;
    case "best_seller":
      return "best" as const;
    case "limited":
      return "limited" as const;
    case "sold_out":
      return "sold" as const;
  }
}

function FavButton({ event }: { event: ConcertEvent }) {
  useDB();
  const session = useAuthStore((s) => s.session);
  const fav = isFavorite(session?.id ?? "", event.id);
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!session) {
          toast.error("Login dulu untuk menyimpan favorit");
          return;
        }
        const added = toggleFavorite(session.id, event.id);
        toast[added ? "success" : "info"](
          added ? "Ditambahkan ke favorit" : "Dihapus dari favorit"
        );
      }}
      aria-label="Favorite"
      className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur-md transition-all ${
        fav
          ? "border-rose-500/40 bg-rose-500/20 text-rose-400"
          : "border-white/20 bg-black/30 text-white hover:text-rose-400"
      }`}
    >
      <Heart className={`h-4 w-4 ${fav ? "fill-current" : ""}`} />
    </button>
  );
}

export function EventCard({ event }: { event: ConcertEvent }) {
  const artist = artistOf(event);
  const venue = venueOf(event);
  const availability = eventAvailability(event);

  const statusLabel =
    availability === "sold_out"
      ? "Sold Out"
      : availability === "low"
        ? "Almost Sold Out"
        : "Tickets Available";

  return (
    <Link
      href={`/concert/${event.slug}`}
      className="group relative block overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-brand-600/20 hover:border-brand-500/40 glow-card"
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <Image
          src={event.poster}
          alt={event.title}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />

        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {event.badges.map((b) => (
            <Badge key={b} variant={badgeVariant(b)}>
              {b === "best_seller" ? "Best Seller" : b}
            </Badge>
          ))}
        </div>
        <FavButton event={event} />

        <div className="absolute inset-x-0 bottom-0 p-4">
          <p className="font-display text-base font-bold leading-tight text-white line-clamp-2">
            {event.title}
          </p>
          <p className="mt-0.5 text-xs font-medium text-white/70">
            {artist?.name}
          </p>
        </div>
      </div>

      <div className="space-y-2.5 p-4">
        <div className="flex items-center justify-between text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-brand-400" />
            {event.date}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-brand-400" /> {event.time}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-brand-400" />
          <span className="truncate">
            {venue?.name}, {venue?.city}
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-3">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted">
              Start from
            </p>
            <p className="font-display text-sm font-bold text-brand-300">
              {formatIDR(eventLowestPrice(event))}
            </p>
          </div>
          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
              availability === "sold_out"
                ? "bg-red-500/15 text-red-400"
                : availability === "low"
                  ? "bg-amber-500/15 text-amber-400"
                  : "bg-emerald-500/15 text-emerald-400"
            }`}
          >
            {statusLabel}
          </span>
        </div>

        <div className="flex items-center justify-center gap-2 rounded-xl bg-surface-2 py-2.5 text-sm font-semibold text-foreground transition-colors group-hover:bg-gradient-brand group-hover:text-white">
          View Detail
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}
