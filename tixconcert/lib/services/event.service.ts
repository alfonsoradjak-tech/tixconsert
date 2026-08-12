import { getDBValue, mutate } from "@/lib/db";
import type {
  ConcertEvent,
  GenreInfo,
  TicketAvailability,
} from "@/lib/types";
import {
  Flame,
  Guitar,
  Headphones,
  Music2,
  Music4,
  PartyPopper,
  Radio,
  Sparkles,
  Trophy,
} from "lucide-react";
import { genId, slugify } from "@/lib/utils";

export type SortKey =
  | "newest"
  | "popular"
  | "price_asc"
  | "price_desc"
  | "nearest";

export const genres: GenreInfo[] = [
  { slug: "pop", name: "Pop", icon: Music4, color: "#f472b6", description: "Musik pop yang catchy dan penuh warna." },
  { slug: "rock", name: "Rock", icon: Guitar, color: "#f87171", description: "Energi gitar dan drum yang membara." },
  { slug: "jazz", name: "Jazz", icon: Headphones, color: "#60a5fa", description: "Elegansi dan improvisasi musik." },
  { slug: "edm", name: "EDM", icon: Sparkles, color: "#22d3ee", description: "Bass elektronik dan visual futuristik." },
  { slug: "hip-hop", name: "Hip Hop", icon: Radio, color: "#f59e0b", description: "Beat dan lirik dari jalanan." },
  { slug: "indie", name: "Indie", icon: Music2, color: "#34d399", description: "Musik independen penuh jiwa." },
  { slug: "r&b", name: "R&B", icon: Music2, color: "#c084fc", description: "Irama soul yang halus dan romantis." },
  { slug: "k-pop", name: "K-Pop", icon: PartyPopper, color: "#fb7185", description: "Idola K-Pop dengan performa memukau." },
  { slug: "dangdut", name: "Dangdut", icon: Flame, color: "#f97316", description: "Goyang khas budaya Nusantara." },
  { slug: "festival", name: "Festival", icon: Trophy, color: "#a78bfa", description: "Perayaan musik multi-panggung." },
];

export function genreSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "other";
}

export function genreByName(name: string): GenreInfo | undefined {
  return genres.find((g) => g.name === name) ?? genres.find((g) => genreSlug(g.name) === genreSlug(name));
}

export function publishedEvents(): ConcertEvent[] {
  return getDBValue().events.filter((e) => e.status === "published");
}

export function getEventBySlug(slug: string): ConcertEvent | undefined {
  return getDBValue().events.find((e) => e.slug === slug);
}

export function getEventById(id: string): ConcertEvent | undefined {
  return getDBValue().events.find((e) => e.id === id);
}

export function featuredEvents(): ConcertEvent[] {
  return publishedEvents()
    .filter((e) => e.featured)
    .sort((a, b) => (b.badges.length - a.badges.length) || a.date.localeCompare(b.date));
}

export function upcomingEvents(): ConcertEvent[] {
  return publishedEvents()
    .filter((e) => e.date >= today())
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function popularEvents(limit = 6): ConcertEvent[] {
  return [...publishedEvents()]
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);
}

export function relatedEvents(event: ConcertEvent, limit = 3): ConcertEvent[] {
  return publishedEvents()
    .filter(
      (e) =>
        e.id !== event.id &&
        (e.category === event.category ||
          e.venueId === event.venueId ||
          e.artistId === event.artistId)
    )
    .sort(
      (a, b) =>
        (b.category === event.category ? 1 : 0) -
        (a.category === event.category ? 1 : 0)
    )
    .slice(0, limit);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function eventAvailability(
  event: ConcertEvent
): TicketAvailability {
  const total = event.ticketCategories.reduce((s, c) => s + c.quantity, 0);
  const sold = event.ticketCategories.reduce((s, c) => s + c.sold, 0);
  const remaining = total - sold;
  if (remaining <= 0) return "sold_out";
  if (remaining <= total * 0.1) return "low";
  return "available";
}

export function eventRemaining(event: ConcertEvent): number {
  return event.ticketCategories.reduce(
    (s, c) => s + Math.max(0, c.quantity - c.sold),
    0
  );
}

export function eventTotalSold(event: ConcertEvent): number {
  return event.ticketCategories.reduce((s, c) => s + c.sold, 0);
}

export function eventLowestPrice(event: ConcertEvent): number {
  return Math.min(...event.ticketCategories.map((c) => c.price));
}

export interface EventFilters {
  query?: string;
  city?: string;
  genre?: string;
  date?: string;
  maxPrice?: number;
  status?: string;
  artist?: string;
}

export function filterEvents(filters: EventFilters): ConcertEvent[] {
  let list = publishedEvents();
  if (filters.query) {
    const q = filters.query.toLowerCase();
    list = list.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.tags.some((t) => t.toLowerCase().includes(q))
    );
  }
  if (filters.city) {
    list = list.filter((e) => venueOf(e)?.city === filters.city);
  }
  if (filters.genre) {
    list = list.filter((e) => genreSlug(e.category) === filters.genre);
  }
  if (filters.date) {
    const d = filters.date;
    list = list.filter(
      (e) => e.date >= d || (d === "upcoming" && e.date >= today())
    );
  }
  if (filters.maxPrice) {
    list = list.filter(
      (e) => Math.min(...e.ticketCategories.map((c) => c.price)) <= filters.maxPrice!
    );
  }
  if (filters.status) {
    list = list.filter((e) => eventAvailability(e) === filters.status);
  }
  if (filters.artist) {
    const artistName = filters.artist.toLowerCase();
    list = list.filter(
      (e) => artistOf(e)?.name.toLowerCase().includes(artistName)
    );
  }
  return list;
}

export function sortEvents(events: ConcertEvent[], sort: SortKey): ConcertEvent[] {
  const sorted = [...events];
  switch (sort) {
    case "newest":
      sorted.sort((a, b) => b.date.localeCompare(a.date));
      break;
    case "popular":
      sorted.sort((a, b) => b.views - a.views);
      break;
    case "price_asc":
      sorted.sort((a, b) => eventLowestPrice(a) - eventLowestPrice(b));
      break;
    case "price_desc":
      sorted.sort((a, b) => eventLowestPrice(b) - eventLowestPrice(a));
      break;
    case "nearest":
      sorted.sort((a, b) => a.date.localeCompare(b.date));
      break;
  }
  return sorted;
}

export function cityList(): string[] {
  return Array.from(
    new Set(publishedEvents().map((e) => venueOf(e)?.city).filter(Boolean))
  ).sort() as string[];
}

export function artistList(): string[] {
  return Array.from(
    new Set(publishedEvents().map((e) => artistOf(e)?.name).filter(Boolean))
  ).sort() as string[];
}

export function venueOf(event: ConcertEvent) {
  return getDBValue().venues.find((v) => v.id === event.venueId);
}

export function artistOf(event: ConcertEvent) {
  return getDBValue().artists.find((a) => a.id === event.artistId);
}

export interface SearchResult {
  title: string;
  subtitle: string;
  slug: string;
  poster: string;
  type: "event" | "artist" | "venue" | "genre";
}

export function globalSearch(query: string, limit = 8): SearchResult[] {  const q = query.trim().toLowerCase();
  if (!q) return [];
  const results: SearchResult[] = [];
  const db = getDBValue();
  for (const e of publishedEvents()) {
    if (
      e.title.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q) ||
      e.tags.some((t) => t.toLowerCase().includes(q)) ||
      artistOf(e)?.name.toLowerCase().includes(q)
    ) {
      results.push({
        title: e.title,
        subtitle: `${venueOf(e)?.city} • ${e.date}`,
        slug: e.slug,
        poster: e.poster,
        type: "event",
      });
    }
  }
  for (const a of db.artists) {
    if (a.name.toLowerCase().includes(q) && a.genre) {
      results.push({
        title: a.name,
        subtitle: `Artist • ${a.genre}`,
        slug: "",
        poster: a.image,
        type: "artist",
      });
    }
  }
  for (const v of db.venues) {
    if (v.name.toLowerCase().includes(q) || v.city.toLowerCase().includes(q)) {
      results.push({
        title: v.name,
        subtitle: `${v.city} • ${v.address}`,
        slug: "",
        poster: "",
        type: "venue",
      });
    }
  }
  return results.slice(0, limit);
}

export interface EventInput {
  title: string;
  artistId: string;
  category: string;
  description: string;
  longDescription: string;
  poster: string;
  date: string;
  time: string;
  venueId: string;
  featured: boolean;
  badges: ConcertEvent["badges"];
  tags: string[];
  ticketCategories: ConcertEvent["ticketCategories"];
  hasSeatLayout: boolean;
}

export function createEvent(input: EventInput): ConcertEvent {
  return mutate((db) => {
    const base = slugify(input.title) || `event-${Date.now()}`;
    let slug = base;
    let n = 2;
    while (db.events.some((e) => e.slug === slug)) {
      slug = `${base}-${n}`;
      n += 1;
    }
    const event: ConcertEvent = {
      id: genId("ev"),
      slug,
      title: input.title,
      artistId: input.artistId,
      category: input.category,
      description: input.description,
      longDescription: input.longDescription,
      poster: input.poster || "/posters/soundwave.jpg",
      date: input.date,
      time: input.time,
      venueId: input.venueId,
      status: "draft",
      featured: input.featured,
      badges: input.badges,
      ticketCategories: input.ticketCategories,
      hasSeatLayout: input.hasSeatLayout,
      tags: input.tags,
      views: 0,
    };
    db.events.push(event);
    return event;
  });
}

export function updateEvent(id: string, patch: Partial<EventInput>) {
  return mutate((db) => {
    const event = db.events.find((e) => e.id === id);
    if (!event) return { ok: false, error: "Event tidak ditemukan." };
    Object.assign(event, patch);
    return { ok: true, event };
  });
}

export function deleteEvent(id: string) {
  return mutate((db) => {
    db.events = db.events.filter((e) => e.id !== id);
    db.tickets = db.tickets.filter((t) => t.eventId !== id);
    db.orders = db.orders.filter((o) => o.eventId !== id);
    db.checkins = db.checkins.filter((c) => c.eventId !== id);
    db.favorites = db.favorites.filter((f) => f.eventId !== id);
  });
}

export function toggleEventStatus(id: string) {
  return mutate((db) => {
    const event = db.events.find((e) => e.id === id);
    if (event) {
      event.status = event.status === "published" ? "draft" : "published";
      return event.status;
    }
    return null;
  });
}

export function allArtists() {
  return getDBValue().artists;
}

export function allVenues() {
  return getDBValue().venues;
}
