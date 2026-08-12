"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SlidersHorizontal, X, ChevronLeft, ChevronRight } from "lucide-react";
import { EventCard } from "@/components/concert/event-card";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchX } from "lucide-react";
import {
  filterEvents,
  sortEvents,
  cityList,
  artistList,
  genres,
  type SortKey,
  eventLowestPrice,
} from "@/lib/services/event.service";
import { useDB } from "@/lib/db";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 8;

function ConcertExplorer() {
  useDB();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [city, setCity] = useState(searchParams.get("city") ?? "");
  const [genre, setGenre] = useState(searchParams.get("genre") ?? "");
  const [date, setDate] = useState("all");
  const [maxPrice, setMaxPrice] = useState(0);
  const [artist, setArtist] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState<SortKey>(
    (searchParams.get("sort") as SortKey) || "nearest"
  );
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [query, city, genre, date, maxPrice, artist, status, sort]);

  const results = useMemo(() => {
    let list = filterEvents({
      query,
      city: city || undefined,
      genre: genre || undefined,
      date: date === "all" ? undefined : date,
      maxPrice: maxPrice || undefined,
      artist: artist || undefined,
      status: status || undefined,
    });
    list = sortEvents(list, sort);
    return list;
  }, [query, city, genre, date, maxPrice, artist, status, sort]);

  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const pageItems = results.slice(
    (current - 1) * PAGE_SIZE,
    current * PAGE_SIZE
  );

  const hasFilters = query || city || genre || date !== "all" || maxPrice || artist || status;

  const clearAll = () => {
    setQuery("");
    setCity("");
    setGenre("");
    setDate("all");
    setMaxPrice(0);
    setArtist("");
    setStatus("");
    router.replace("/concerts");
  };

  const priceOptions = [0, 300000, 500000, 800000, 1000000, 1500000, 2500000];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-black tracking-tight sm:text-4xl">
          Explore <span className="text-gradient">Concerts</span>
        </h1>
        <p className="mt-1.5 text-sm text-muted">
          {results.length} konser ditemukan. Temukan dan amankan tiketmu sekarang.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
          <div className="lg:col-span-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search concert, artist, venue..."
            />
          </div>
          <Select value={city} onChange={(e) => setCity(e.target.value)}>
            <option value="">All Cities</option>
            {cityList().map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
          <Select value={genre} onChange={(e) => setGenre(e.target.value)}>
            <option value="">All Genres</option>
            {genres.map((g) => (
              <option key={g.slug} value={g.slug}>{g.name}</option>
            ))}
          </Select>
          <Select value={date} onChange={(e) => setDate(e.target.value)}>
            <option value="all">Any Date</option>
            <option value={new Date().toISOString().slice(0, 10)}>Today</option>
            <option value={upcomingDate(7)}>Next 7 Days</option>
            <option value={upcomingDate(30)}>Next 30 Days</option>
            <option value="upcoming">Upcoming</option>
          </Select>
          <Select
            value={maxPrice ? String(maxPrice) : ""}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
          >
            <option value="0">Any Price</option>
            {priceOptions.slice(1).map((p) => (
              <option key={p} value={p}>
                Under {p.toLocaleString("id-ID")}
              </option>
            ))}
          </Select>
          <Select value={artist} onChange={(e) => setArtist(e.target.value)}>
            <option value="">All Artists</option>
            {artistList().map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </Select>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-muted" />
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-9 w-40 text-xs"
            >
              <option value="">All Status</option>
              <option value="available">Available</option>
              <option value="low">Almost Sold Out</option>
              <option value="sold_out">Sold Out</option>
            </Select>
            <Select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="h-9 w-40 text-xs"
            >
              <option value="nearest">Date: Nearest</option>
              <option value="newest">Newest</option>
              <option value="popular">Most Popular</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </Select>
          </div>
          {hasFilters && (
            <button
              onClick={clearAll}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" /> Clear All Filters
            </button>
          )}
        </div>
      </div>

      <div className="mt-8">
        {pageItems.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {pageItems.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card">
            <EmptyState
              icon={SearchX}
              title="No concerts found"
              description="Coba ubah filter atau kata kunci pencarian kamu."
              actionLabel="Clear Filters"
              actionHref="/concerts"
            />
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          <Button
            variant="secondary"
            size="icon"
            disabled={current === 1}
            onClick={() => setPage(current - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={cn(
                "h-10 w-10 rounded-xl text-sm font-bold transition-all",
                current === i + 1
                  ? "bg-gradient-brand text-white shadow-lg shadow-brand-600/25"
                  : "border border-border bg-card text-muted hover:text-foreground"
              )}
            >
              {i + 1}
            </button>
          ))}
          <Button
            variant="secondary"
            size="icon"
            disabled={current === totalPages}
            onClick={() => setPage(current + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="mt-8 text-center text-xs text-muted">
        Showing {pageItems.length} of {results.length} concerts
      </div>
    </div>
  );
}

function upcomingDate(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function ConcertsPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <ConcertExplorer />
    </Suspense>
  );
}
