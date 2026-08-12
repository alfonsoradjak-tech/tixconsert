"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { FeaturedCard } from "@/components/concert/featured-card";
import { EventCard } from "@/components/concert/event-card";
import {
  featuredEvents,
  upcomingEvents,
  popularEvents,
} from "@/lib/services/event.service";
import { useDB } from "@/lib/db";

export default function EventsPage() {
  useDB();
  const featured = featuredEvents();
  const upcoming = upcomingEvents().slice(0, 8);
  const popular = popularEvents(4);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-brand-400">
          <Sparkles className="h-3.5 w-3.5" /> Event lineup
        </p>
        <h1 className="mt-2 font-display text-3xl font-black tracking-tight sm:text-4xl">
          Featured & <span className="text-gradient">Upcoming Events</span>
        </h1>
        <p className="mt-1.5 text-sm text-muted">
          Pilihan event unggulan dan jadwal konser terdekat.
        </p>
      </div>

      {featured.length > 0 && (
        <section className="space-y-6">
          {featured.map((e) => (
            <FeaturedCard key={e.id} event={e} />
          ))}
        </section>
      )}

      <section className="mt-14">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-2xl font-black tracking-tight">
            Upcoming Events
          </h2>
          <Link
            href="/concerts?sort=nearest"
            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-brand-300 hover:text-brand-200"
          >
            View All
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {upcoming.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      </section>

      <section className="mt-14">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-2xl font-black tracking-tight">
            Most Popular
          </h2>
          <Link
            href="/concerts?sort=popular"
            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-brand-300 hover:text-brand-200"
          >
            View All
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {popular.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      </section>
    </div>
  );
}
