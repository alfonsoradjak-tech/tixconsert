"use client";

import { useParams, notFound } from "next/navigation";
import { EventForm } from "@/components/admin/event-form";
import { useDB } from "@/lib/db";
import { getEventById } from "@/lib/services/event.service";

export default function EditEventPage() {
  useDB();
  const params = useParams();
  const id = String(params.id);
  const event = getEventById(id);
  if (!event) notFound();
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-black tracking-tight">Edit Event</h2>
        <p className="text-sm text-muted">Perbarui detail event {event.title}.</p>
      </div>
      <EventForm event={event} />
    </div>
  );
}
