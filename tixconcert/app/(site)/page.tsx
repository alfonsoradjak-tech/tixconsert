"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, Sparkles } from "lucide-react";
import { Hero } from "@/components/home/hero";
import { EventCard } from "@/components/concert/event-card";
import { FeaturedCard } from "@/components/concert/featured-card";
import { CategoryCard } from "@/components/concert/category-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  upcomingEvents,
  featuredEvents,
  genres,
} from "@/lib/services/event.service";
import { useDB } from "@/lib/db";

function SectionHeader({
  eyebrow,
  title,
  subtitle,
  href,
  linkLabel,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-brand-400">
          <Sparkles className="h-3.5 w-3.5" /> {eyebrow}
        </p>
        <h2 className="mt-2 font-display text-2xl font-black tracking-tight sm:text-3xl">
          {title}
        </h2>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {href && linkLabel && (
        <Link
          href={href}
          className="group inline-flex items-center gap-1.5 text-sm font-semibold text-brand-300 transition-colors hover:text-brand-200"
        >
          {linkLabel}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}

export default function HomePage() {
  useDB();
  const upcoming = upcomingEvents().slice(0, 8);
  const featured = featuredEvents().slice(0, 3);
  const cats = genres;

  return (
    <>
      <Hero />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Don't miss it"
          title="Upcoming Concert"
          subtitle="Konser paling ditunggu dengan tiket terbatas."
          href="/concerts?sort=nearest"
          linkLabel="View All"
        />
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {upcoming.slice(0, 4).map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:mt-6 sm:gap-6 lg:grid-cols-4">
          {upcoming.slice(4, 8).map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-b from-transparent via-brand-500/[0.04] to-transparent">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Handpicked"
            title="Featured Events"
            subtitle="Pilihan event unggulan edisi ini."
            href="/concerts"
            linkLabel="Explore All"
          />
          <div className="space-y-6">
            {featured.map((e) => (
              <FeaturedCard key={e.id} event={e} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Browse by genre"
          title="Music Categories"
          subtitle="Cari berdasarkan genre favoritmu."
          href="/categories"
          linkLabel="All Categories"
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
          {cats.map((g) => (
            <CategoryCard key={g.slug} genre={g} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-brand-500/20 bg-gradient-brand-soft px-6 py-12 text-center sm:px-12">
          <div className="absolute inset-0 hero-grid opacity-40" />
          <div className="relative">
            <CalendarDays className="mx-auto h-10 w-10 text-brand-400" />
            <h2 className="mt-4 font-display text-2xl font-black sm:text-4xl">
              Never Miss a Concert
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted">
              Dapatkan update konser terbaru, presale ticket, dan promo eksklusif
              langsung di inbox kamu.
            </p>
            <form
              className="mx-auto mt-6 flex max-w-md flex-col gap-2 sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault();
                const email = (
                  new FormData(e.currentTarget).get("email") as string
                ).trim();
                if (email) {
                  e.currentTarget.reset();
                }
              }}
            >
              <Input
                name="email"
                type="email"
                required
                placeholder="Enter your email address"
                className="flex-1 bg-surface"
              />
              <Button type="submit" className="shrink-0">
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
