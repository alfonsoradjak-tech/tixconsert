"use client";

import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin, ArrowRight, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { badgeVariant } from "@/components/concert/event-card";
import { artistOf, venueOf, eventLowestPrice } from "@/lib/services/event.service";
import { formatIDR } from "@/lib/utils";
import { useAuthStore } from "@/lib/store/auth-store";
import { isFavorite, toggleFavorite } from "@/lib/services/favorite.service";
import { toast } from "sonner";
import { useDB } from "@/lib/db";
import type { ConcertEvent } from "@/lib/types";

export function FeaturedCard({ event }: { event: ConcertEvent }) {
  useDB();
  const artist = artistOf(event);
  const venue = venueOf(event);
  const session = useAuthStore((s) => s.session);
  const fav = isFavorite(session?.id ?? "", event.id);

  return (
    <Link
      href={`/concert/${event.slug}`}
      className="group relative block overflow-hidden rounded-3xl border border-border bg-card transition-all duration-300 hover:shadow-2xl hover:shadow-brand-600/25 hover:border-brand-500/40 glow-card"
    >
      <div className="relative aspect-[16/10] sm:aspect-[16/9]">
        <Image
          src={event.poster}
          alt={event.title}
          fill
          sizes="(max-width: 768px) 100vw, 66vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />

        <div className="absolute left-4 top-4 flex flex-wrap gap-1.5">
          {event.badges.map((b) => (
            <Badge key={b} variant={badgeVariant(b)}>
              {b === "best_seller" ? "Best Seller" : b}
            </Badge>
          ))}
          <Badge variant="neutral" className="text-white border-white/25 bg-black/40">
            Featured
          </Badge>
        </div>

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
          className={`absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-md transition-all ${
            fav
              ? "border-rose-500/40 bg-rose-500/20 text-rose-400"
              : "border-white/20 bg-black/30 text-white hover:text-rose-400"
          }`}
        >
          <Heart className={`h-4.5 w-4.5 ${fav ? "fill-current" : ""}`} />
        </button>

        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-300">
            Featured Events
          </p>
          <h3 className="mt-1.5 font-display text-xl font-black text-white sm:text-3xl">
            {event.title}
          </h3>
          <p className="mt-1 text-sm font-medium text-white/70 sm:text-base">
            {artist?.name}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/75 sm:text-sm">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-brand-300" /> {event.date}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-brand-300" /> {venue?.name},{" "}
              {venue?.city}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 p-5 sm:p-6">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted">
            Start from
          </p>
          <p className="font-display text-xl font-bold text-brand-300">
            {formatIDR(eventLowestPrice(event))}
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-xl bg-gradient-brand px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-600/25 transition-all group-hover:shadow-brand-600/40 group-hover:brightness-110">
          Get Ticket
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
