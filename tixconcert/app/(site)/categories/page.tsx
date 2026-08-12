"use client";

import { Sparkles } from "lucide-react";
import { CategoryCard } from "@/components/concert/category-card";
import { genres } from "@/lib/services/event.service";

export default function CategoriesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-brand-400">
          <Sparkles className="h-3.5 w-3.5" /> Browse by genre
        </p>
        <h1 className="mt-2 font-display text-3xl font-black tracking-tight sm:text-4xl">
          Music <span className="text-gradient">Categories</span>
        </h1>
        <p className="mt-1.5 text-sm text-muted">
          Jelajahi semua kategori musik dan temukan konser favoritmu.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-5">
        {genres.map((g) => (
          <CategoryCard key={g.slug} genre={g} />
        ))}
      </div>
    </div>
  );
}
