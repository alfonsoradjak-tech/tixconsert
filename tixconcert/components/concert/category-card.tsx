"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { publishedEvents, genreByName } from "@/lib/services/event.service";
import { useDB } from "@/lib/db";
import { cn } from "@/lib/utils";
import type { GenreInfo } from "@/lib/types";

export function CategoryCard({ genre }: { genre: GenreInfo }) {
  useDB();
  const count = publishedEvents().filter(
    (e) => genreByName(e.category)?.slug === genre.slug
  ).length;

  return (
    <Link
      href={`/categories/${genre.slug}`}
      className="group relative flex flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border border-border bg-card p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-600/15 hover:border-brand-500/40"
    >
      <div
        className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${genre.color}22, transparent 70%)`,
        }}
      />
      <div
        className="relative flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
        style={{ backgroundColor: `${genre.color}1a`, color: genre.color }}
      >
        <genre.icon className="h-6 w-6" />
      </div>
      <div className="relative">
        <p className="font-display text-sm font-bold">{genre.name}</p>
        <p className="mt-0.5 text-xs text-muted">
          {count} event
          {count === 1 ? "" : "s"}
        </p>
      </div>
      <ArrowUpRight
        className={cn(
          "absolute right-3 top-3 h-4 w-4 text-muted transition-all group-hover:text-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        )}
      />
    </Link>
  );
}
