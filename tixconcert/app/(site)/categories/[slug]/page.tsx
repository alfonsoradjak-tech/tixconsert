"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { EventCard } from "@/components/concert/event-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Music2 } from "lucide-react";
import {
  genres,
  genreByName,
  publishedEvents,
} from "@/lib/services/event.service";
import { useDB } from "@/lib/db";

export default function CategoryPage() {
  useDB();
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : (params.slug ?? "");
  const genre = genreByName(slug.replace(/-/g, " ")) ?? genres.find((g) => g.slug === slug);
  if (!genre) notFound();
  const events = publishedEvents().filter(
    (e) => genreByName(e.category)?.slug === genre.slug
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-6 flex items-center gap-1.5 text-xs text-muted">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/categories" className="hover:text-foreground">Categories</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">{genre.name}</span>
      </nav>

      <div className="mb-8 flex items-center gap-4">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{ backgroundColor: `${genre.color}1a`, color: genre.color }}
        >
          <genre.icon className="h-7 w-7" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-black tracking-tight sm:text-4xl">
            {genre.name}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {genre.description} · {events.length} event tersedia
          </p>
        </div>
      </div>

      {events.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {events.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card">
          <EmptyState
            icon={Music2}
            title="No events in this category yet"
            description="Belum ada konser untuk kategori ini. Coba kategori lain."
            actionLabel="Explore Categories"
            actionHref="/categories"
          />
        </div>
      )}
    </div>
  );
}
