"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  Globe,
  EyeOff,
  CalendarDays,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { useDB } from "@/lib/db";
import {
  artistOf,
  venueOf,
  eventTotalSold,
  eventLowestPrice,
} from "@/lib/services/event.service";
import { deleteEvent, toggleEventStatus } from "@/lib/services/event.service";
import { formatDate, formatIDR } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminEventsPage() {
  useDB();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const events = useDB().events
    .filter((e) => {
      const matchQ =
        !query ||
        e.title.toLowerCase().includes(query.toLowerCase()) ||
        (artistOf(e)?.name.toLowerCase().includes(query.toLowerCase()) ?? false);
      const matchS = status === "all" || e.status === status;
      return matchQ && matchS;
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-black tracking-tight">Manage Events</h2>
          <p className="text-sm text-muted">
            Kelola event, tiket, dan status publikasi.
          </p>
        </div>
        <Button href="/admin/events/new">
          <Plus className="h-4 w-4" /> Add Event
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-52">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search event or artist..."
            className="pl-10"
          />
        </div>
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-40"
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {events.map((e) => {
          const isPublished = e.status === "published";
          return (
            <Card key={e.id} className="overflow-hidden transition-all hover:border-brand-500/40">
              <div className="relative h-40">
                <Image
                  src={e.poster}
                  alt={e.title}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute left-3 top-3">
                  <Badge variant={isPublished ? "success" : "neutral"}>
                    {isPublished ? "Published" : "Draft"}
                  </Badge>
                </div>
                <div className="absolute bottom-3 left-4 right-4">
                  <p className="font-display text-sm font-black text-white line-clamp-1">
                    {e.title}
                  </p>
                  <p className="flex items-center gap-1 text-xs text-white/70">
                    <CalendarDays className="h-3 w-3" />
                    {formatDate(e.date)}
                  </p>
                </div>
              </div>
              <div className="space-y-2.5 p-4">
                <div className="flex items-center justify-between text-xs text-muted">
                  <span>{artistOf(e)?.name}</span>
                  <span>{venueOf(e)?.city}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span>
                    <span className="font-bold text-foreground">
                      {eventTotalSold(e)}
                    </span>{" "}
                    sold
                  </span>
                  <span className="font-display font-black text-brand-300">
                    {formatIDR(eventLowestPrice(e))}+
                  </span>
                </div>
                <div className="flex gap-1.5 pt-1">
                  <Button size="xs" variant="secondary" className="flex-1" href={`/concert/${e.slug}`}>
                    <Eye className="h-3.5 w-3.5" /> View
                  </Button>
                  <Button size="xs" variant="secondary" className="flex-1" href={`/admin/events/${e.id}/edit`}>
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button
                    size="xs"
                    variant="subtle"
                    className="flex-1"
                    onClick={() => {
                      const st = toggleEventStatus(e.id);
                      toast[st === "published" ? "success" : "info"](
                        st === "published" ? "Event dipublikasikan" : "Event di-unpublish"
                      );
                    }}
                  >
                    {isPublished ? (
                      <>
                        <EyeOff className="h-3.5 w-3.5" /> Unpublish
                      </>
                    ) : (
                      <>
                        <Globe className="h-3.5 w-3.5" /> Publish
                      </>
                    )}
                  </Button>
                  <Button
                    size="xs"
                    variant="danger"
                    className="flex-1"
                    onClick={() => setConfirmDelete(e.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {events.length === 0 && (
        <Card className="p-12 text-center text-sm text-muted">
          Tidak ada event ditemukan.
        </Card>
      )}

      <Modal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Delete Event"
      >
        <p className="text-sm text-muted">
          Hapus event beserta seluruh tiket, order, dan data terkait? Tindakan ini
          tidak bisa dibatalkan.
        </p>
        <div className="mt-5 flex gap-2">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => setConfirmDelete(null)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            onClick={() => {
              if (confirmDelete) {
                deleteEvent(confirmDelete);
                toast.success("Event dihapus");
              }
              setConfirmDelete(null);
            }}
          >
            Delete Event
          </Button>
        </div>
      </Modal>
    </div>
  );
}
