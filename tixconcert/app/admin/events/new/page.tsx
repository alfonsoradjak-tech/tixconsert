"use client";

import { EventForm } from "@/components/admin/event-form";
import { useDB } from "@/lib/db";

export default function NewEventPage() {
  useDB();
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-black tracking-tight">Add Event</h2>
        <p className="text-sm text-muted">Buat event baru dengan kategori tiket.</p>
      </div>
      <EventForm />
    </div>
  );
}
