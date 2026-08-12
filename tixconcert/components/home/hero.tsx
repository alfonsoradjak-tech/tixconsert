"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, Sparkles, Ticket, ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="/posters/soundwave.jpg"
          alt="Concert"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/70 to-background" />
        <div className="absolute inset-0 hero-grid opacity-60" />
      </div>

      <div className="relative mx-auto flex min-h-[80vh] max-w-7xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6 lg:px-8">
        <div className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold text-white/80 backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5 text-brand-300" />
          The Biggest Live Music Platform in Indonesia
        </div>

        <h1 className="animate-fade-up mt-6 font-display text-4xl font-black leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl" style={{ animationDelay: "80ms" }}>
          Experience The Music.
          <br />
          <span className="text-gradient">Live The Moment.</span>
        </h1>

        <p className="animate-fade-up mt-5 max-w-xl text-sm text-white/70 sm:text-lg" style={{ animationDelay: "160ms" }}>
          Temukan konser favoritmu dan dapatkan tiketnya dengan mudah.
        </p>

        <div className="animate-fade-up mt-8 flex w-full max-w-xl items-center gap-2 rounded-2xl border border-white/15 bg-white/10 p-1.5 backdrop-blur-xl" style={{ animationDelay: "240ms" }}>
          <Search className="ml-3 h-5 w-5 shrink-0 text-white/60" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && query.trim()) {
                router.push(`/search?q=${encodeURIComponent(query)}`);
              }
            }}
            placeholder="Search artist, concert, or event..."
            className="w-full bg-transparent text-sm text-white placeholder:text-white/50 outline-none"
          />
          <Button
            size="sm"
            className="shrink-0"
            onClick={() => router.push(`/search?q=${encodeURIComponent(query)}`)}
          >
            Search
          </Button>
        </div>

        <div className="animate-fade-up mt-8 flex flex-col gap-3 sm:flex-row" style={{ animationDelay: "320ms" }}>
          <Button href="/concerts" size="xl" className="animate-glow">
            Explore Concert
            <ArrowRight className="h-5 w-5" />
          </Button>
          <Button
            href="/concerts?sort=nearest"
            size="xl"
            className="border border-white/25 bg-white/10 text-white backdrop-blur-md hover:bg-white/20 shadow-none"
          >
            <Ticket className="h-5 w-5" />
            Buy Ticket
          </Button>
        </div>

        <div className="animate-fade-up mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-white/60" style={{ animationDelay: "400ms" }}>
          <span className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/15">
              <Play className="h-3 w-3 fill-emerald-400 text-emerald-400" />
            </span>
            50+ Events Every Year
          </span>
          <span>120K+ Tickets Sold</span>
          <span>Secure Payment</span>
          <span>Instant E-Ticket</span>
        </div>
      </div>
    </section>
  );
}
