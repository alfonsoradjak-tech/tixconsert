"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, FieldError } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { genres } from "@/lib/services/event.service";
import {
  allArtists,
  allVenues,
  createEvent,
  updateEvent,
} from "@/lib/services/event.service";
import { formatIDR, cn } from "@/lib/utils";
import { toast } from "sonner";
import type { ConcertEvent, EventBadge, TicketCategory } from "@/lib/types";

const posterOptions = [
  "soundwave", "java-music", "rock-revolution", "summer-beats",
  "indie-night", "edm-universe", "coldplay-live", "tulus-harmoni",
  "dewa19", "niki-moonchild", "star-kids", "dangdut-melodi",
  "jazz-city", "hiphop-takeover", "neon-odeon", "rnb-romance",
].map((p) => `/posters/${p}.jpg`);

interface CategoryRow {
  name: string;
  price: number;
  quantity: number;
  benefits: string;
  isSeated: boolean;
}

const defaultRows: CategoryRow[] = [
  { name: "VIP", price: 1500000, quantity: 300, benefits: "Exclusive entrance, Meet & greet, Merchandise", isSeated: false },
  { name: "Festival", price: 750000, quantity: 3000, benefits: "Full access", isSeated: false },
  { name: "Regular", price: 450000, quantity: 5000, benefits: "General admission", isSeated: false },
];

export function EventForm({ event }: { event?: ConcertEvent }) {
  const router = useRouter();
  const artists = allArtists();
  const venues = allVenues();

  const [title, setTitle] = useState(event?.title ?? "");
  const [artistId, setArtistId] = useState(event?.artistId ?? artists[0]?.id ?? "");
  const [category, setCategory] = useState(event?.category ?? "Pop");
  const [description, setDescription] = useState(event?.description ?? "");
  const [longDescription, setLongDescription] = useState(event?.longDescription ?? "");
  const [poster, setPoster] = useState(event?.poster ?? posterOptions[0]);
  const [date, setDate] = useState(event?.date ?? "2026-12-31");
  const [time, setTime] = useState(event?.time ?? "19:00");
  const [venueId, setVenueId] = useState(event?.venueId ?? venues[0]?.id ?? "");
  const [featured, setFeatured] = useState(event?.featured ?? false);
  const [badges, setBadges] = useState<EventBadge[]>(event?.badges ?? []);
  const [tags, setTags] = useState(event?.tags.join(", ") ?? "");
  const [hasSeatLayout, setHasSeatLayout] = useState(event?.hasSeatLayout ?? false);
  const [rows, setRows] = useState<CategoryRow[]>(
    event
      ? event.ticketCategories.map((c) => ({
          name: c.name,
          price: c.price,
          quantity: c.quantity,
          benefits: c.benefits.join(", "),
          isSeated: c.isSeated,
        }))
      : defaultRows
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (title.trim().length < 3) errs.title = "Judul minimal 3 karakter";
    if (!date) errs.date = "Tanggal wajib diisi";
    if (rows.length === 0) errs.rows = "Minimal satu kategori tiket";
    for (const r of rows) {
      if (!r.name.trim()) errs.rows = "Nama kategori wajib diisi";
      if (r.price <= 0) errs.rows = "Harga harus lebih dari 0";
      if (r.quantity <= 0) errs.rows = "Jumlah tiket harus lebih dari 0";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = () => {
    if (!validate()) {
      toast.error("Periksa kembali form");
      return;
    }
    const ticketCategories: TicketCategory[] = rows.map((r) => ({
      id: `${r.name.toLowerCase().replace(/[^a-z]/g, "")}_${Math.random().toString(36).slice(2, 8)}`,
      name: r.name.trim(),
      price: r.price,
      quantity: r.quantity,
      sold: 0,
      benefits: r.benefits.split(",").map((b) => b.trim()).filter(Boolean),
      isSeated: r.isSeated,
    }));

    const payload = {
      title: title.trim(),
      artistId,
      category,
      description,
      longDescription: longDescription || description,
      poster,
      date,
      time,
      venueId,
      featured,
      badges,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      ticketCategories,
      hasSeatLayout,
    };

    if (event) {
      const res = updateEvent(event.id, payload);
      if (res.ok) {
        toast.success("Event diperbarui");
        router.push("/admin/events");
      } else toast.error(res.error ?? "Gagal memperbarui");
    } else {
      createEvent(payload);
      toast.success("Event dibuat. Publikasikan di halaman Events.");
      router.push("/admin/events");
    }
  };

  const toggleBadge = (b: EventBadge) => {
    setBadges((prev) =>
      prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]
    );
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <Card className="p-5 sm:p-6">
          <h3 className="mb-4 font-display text-base font-black">Event Information</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Event Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Contoh: Jazz in the Park" />
              {errors.title && <FieldError message={errors.title} />}
            </div>
            <div>
              <Label>Artist</Label>
              <Select value={artistId} onChange={(e) => setArtistId(e.target.value)}>
                {artists.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Category</Label>
              <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                {genres.map((g) => (
                  <option key={g.slug} value={g.name}>{g.name}</option>
                ))}
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label>Short Description</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Label>Long Description</Label>
              <Textarea value={longDescription} onChange={(e) => setLongDescription(e.target.value)} />
            </div>
            <div>
              <Label>Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              {errors.date && <FieldError message={errors.date} />}
            </div>
            <div>
              <Label>Time</Label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
            <div>
              <Label>Venue</Label>
              <Select value={venueId} onChange={(e) => setVenueId(e.target.value)}>
                {venues.map((v) => (
                  <option key={v.id} value={v.id}>{v.name} — {v.city}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Tags (comma separated)</Label>
              <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="festival, jakarta, dj" />
            </div>
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <h3 className="mb-4 font-display text-base font-black">Ticket Categories</h3>
          {errors.rows && <FieldError message={errors.rows} />}
          <div className="space-y-3">
            {rows.map((row, idx) => (
              <div key={idx} className="grid gap-2 rounded-xl border border-border bg-surface-2/40 p-3 sm:grid-cols-[1fr_120px_110px_auto]">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={row.name}
                    onChange={(e) =>
                      setRows((r) => r.map((x, i) => (i === idx ? { ...x, name: e.target.value } : x)))
                    }
                    placeholder="VIP"
                  />
                </div>
                <div>
                  <Label>Price</Label>
                  <Input
                    type="number"
                    value={row.price}
                    onChange={(e) =>
                      setRows((r) => r.map((x, i) => (i === idx ? { ...x, price: +e.target.value } : x)))
                    }
                  />
                </div>
                <div>
                  <Label>Qty</Label>
                  <Input
                    type="number"
                    value={row.quantity}
                    onChange={(e) =>
                      setRows((r) => r.map((x, i) => (i === idx ? { ...x, quantity: +e.target.value } : x)))
                    }
                  />
                </div>
                <div className="flex items-end gap-1">
                  <label className="mb-1.5 flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-muted">
                    <input
                      type="checkbox"
                      checked={row.isSeated}
                      onChange={(e) =>
                        setRows((r) => r.map((x, i) => (i === idx ? { ...x, isSeated: e.target.checked } : x)))
                      }
                      className="h-4 w-4 accent-brand-500"
                    />
                    Seated
                  </label>
                  <button
                    onClick={() => setRows((r) => r.filter((_, i) => i !== idx))}
                    className="mb-1.5 rounded-lg p-1.5 text-muted transition-colors hover:bg-red-500/10 hover:text-red-400"
                    aria-label="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="sm:col-span-full">
                  <Label>Benefits (comma separated)</Label>
                  <Input
                    value={row.benefits}
                    onChange={(e) =>
                      setRows((r) => r.map((x, i) => (i === idx ? { ...x, benefits: e.target.value } : x)))
                    }
                    placeholder="Exclusive entrance, Meet & greet"
                  />
                </div>
              </div>
            ))}
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="mt-3"
            onClick={() =>
              setRows((r) => [...r, { name: "", price: 0, quantity: 0, benefits: "", isSeated: false }])
            }
          >
            <Plus className="h-4 w-4" /> Add Category
          </Button>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="p-5">
          <h3 className="mb-3 font-display text-base font-black">Poster</h3>
          <div className="grid grid-cols-4 gap-2">
            {posterOptions.map((p) => (
              <button
                key={p}
                onClick={() => setPoster(p)}
                className={cn(
                  "relative aspect-[3/4] overflow-hidden rounded-lg border-2 transition-all",
                  poster === p ? "border-brand-500" : "border-transparent opacity-60 hover:opacity-100"
                )}
              >
                <Image src={p} alt="" fill sizes="80px" className="object-cover" />
                {poster === p && (
                  <span className="absolute right-1 top-1 rounded-full bg-brand-500 p-0.5 text-white">
                    <Check className="h-3 w-3" />
                  </span>
                )}
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="mb-3 font-display text-base font-black">Badges</h3>
          <div className="flex flex-wrap gap-2">
            {(["hot", "best_seller", "limited", "sold_out"] as EventBadge[]).map((b) => (
              <button
                key={b}
                onClick={() => toggleBadge(b)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition-all",
                  badges.includes(b)
                    ? "border-brand-500 bg-brand-500/15 text-brand-300"
                    : "border-border text-muted hover:text-foreground"
                )}
              >
                {b.replace("_", " ")}
              </button>
            ))}
          </div>
        </Card>

        <Card className="space-y-4 p-5">
          <label className="flex cursor-pointer items-center justify-between">
            <div>
              <p className="text-sm font-bold">Featured Event</p>
              <p className="text-xs text-muted">Tampilkan di section Featured</p>
            </div>
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="h-5 w-5 accent-brand-500"
            />
          </label>
          <label className="flex cursor-pointer items-center justify-between">
            <div>
              <p className="text-sm font-bold">Seat Layout</p>
              <p className="text-xs text-muted">Event menggunakan seat numbering</p>
            </div>
            <input
              type="checkbox"
              checked={hasSeatLayout}
              onChange={(e) => setHasSeatLayout(e.target.checked)}
              className="h-5 w-5 accent-brand-500"
            />
          </label>

          <Button className="w-full" size="lg" onClick={submit}>
            {event ? "Save Changes" : "Create Event"}
          </Button>
          {event && (
            <p className="text-center text-xs text-muted">
              Total harga dari kategori:{" "}
              {formatIDR(rows.reduce((s, r) => s + r.price, 0))}
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
