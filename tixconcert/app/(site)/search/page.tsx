"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search as SearchIcon, SearchX } from "lucide-react";
import { EventCard } from "@/components/concert/event-card";
import { Input } from "@/components/ui/input";
import { PageLoader } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { filterEvents, sortEvents } from "@/lib/services/event.service";
import { useDB } from "@/lib/db";

function SearchPageInner() {
  useDB();
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(q);

  useEffect(() => setQuery(q), [q]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return sortEvents(
      filterEvents({ query: query.trim() }),
      "popular"
    );
  }, [query]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto mb-8 max-w-2xl">
        <h1 className="text-center font-display text-3xl font-black tracking-tight sm:text-4xl">
          Search <span className="text-gradient">Concerts</span>
        </h1>
        <p className="mt-1.5 text-center text-sm text-muted">
          Cari konser, artis, venue, atau kota favoritmu.
        </p>
        <div className="relative mt-5">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Contoh: "Coldplay", "Jakarta", "Festival"...'
            className="h-13 py-3 pl-12 text-base"
            autoFocus
          />
        </div>
      </div>

      {query.trim() && (
        <p className="mb-6 text-sm text-muted">
          <span className="font-semibold text-foreground">{results.length}</span>{" "}
          hasil untuk &quot;{query}&quot;
        </p>
      )}

      {results.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      ) : query.trim() ? (
        <div className="rounded-2xl border border-border bg-card">
          <EmptyState
            icon={SearchX}
            title="No results found"
            description={`Tidak ada konser yang cocok dengan "${query}". Coba kata kunci lain.`}
          />
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card">
          <EmptyState
            icon={SearchX}
            title="Search for concerts"
            description="Ketik nama konser, artis, venue, atau kota untuk mulai mencari."
          />
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <SearchPageInner />
    </Suspense>
  );
}
