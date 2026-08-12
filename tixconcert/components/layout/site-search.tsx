"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, MapPin, Music4, Loader2 } from "lucide-react";
import { globalSearch } from "@/lib/services/event.service";
import type { SearchResult } from "@/lib/services/event.service";
import { useDebouncedValue } from "@/lib/hooks";

export function SiteSearch({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debounced = useDebouncedValue(query, 200);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!debounced.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const t = setTimeout(() => {
      setResults(globalSearch(debounced, 7));
      setLoading(false);
    }, 120);
    return () => clearTimeout(t);
  }, [debounced]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div ref={ref} className={`relative ${className ?? ""}`}>
      <form onSubmit={submit}>
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search artist, concert, or event..."
          className="w-full h-10 rounded-xl border border-border bg-surface pl-10 pr-4 text-sm text-foreground placeholder:text-muted/70 outline-none transition-all focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/20"
        />
      </form>

      {open && (query.trim() || loading) && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl animate-scale-in">
          {loading ? (
            <div className="flex items-center gap-2 p-4 text-sm text-muted">
              <Loader2 className="h-4 w-4 animate-spin" /> Mencari...
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="max-h-[340px] overflow-y-auto p-1.5">
                {results.map((r, i) => (
                  <div key={i}>
                    {r.type === "event" ? (
                      <Link
                        href={`/concert/${r.slug}`}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-surface-2"
                      >
                        <div
                          className="h-12 w-9 shrink-0 rounded-lg bg-cover bg-center"
                          style={{ backgroundImage: `url(${r.poster})` }}
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">
                            {r.title}
                          </p>
                          <p className="flex items-center gap-1 text-xs text-muted">
                            <MapPin className="h-3 w-3" /> {r.subtitle}
                          </p>
                        </div>
                      </Link>
                    ) : (
                      <div className="flex items-center gap-3 rounded-xl p-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/10 text-brand-300">
                          <Music4 className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{r.title}</p>
                          <p className="text-xs text-muted">{r.subtitle}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  setOpen(false);
                  router.push(`/search?q=${encodeURIComponent(query)}`);
                }}
                className="w-full border-t border-border p-3 text-center text-sm font-semibold text-brand-300 hover:bg-surface-2"
              >
                Lihat semua hasil untuk &quot;{query}&quot;
              </button>
            </>
          ) : (
            <div className="p-4 text-center text-sm text-muted">
              Tidak ada hasil untuk &quot;{query}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  );
}
