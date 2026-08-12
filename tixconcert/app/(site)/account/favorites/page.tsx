"use client";

import { Heart } from "lucide-react";
import { EventCard } from "@/components/concert/event-card";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuthStore } from "@/lib/store/auth-store";
import { useDB } from "@/lib/db";
import { getFavoriteEvents } from "@/lib/services/favorite.service";

export default function FavoritesPage() {
  useDB();
  const session = useAuthStore((s) => s.session);
  if (!session) return null;
  const events = getFavoriteEvents(session.id);

  return (
    <div>
      <h2 className="mb-5 font-display text-xl font-black">
        My Favorites ({events.length})
      </h2>
      {events.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3">
          {events.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            icon={Heart}
            title="No favorites yet"
            description="Klik ikon hati pada konser untuk menyimpannya di sini."
            actionLabel="Explore Concerts"
            actionHref="/concerts"
          />
        </Card>
      )}
    </div>
  );
}
