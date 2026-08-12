import { getDBValue, mutate } from "@/lib/db";
import type { ConcertEvent } from "@/lib/types";

export function isFavorite(userId: string, eventId: string): boolean {
  if (!userId) return false;
  return getDBValue().favorites.some(
    (f) => f.userId === userId && f.eventId === eventId
  );
}

export function toggleFavorite(userId: string, eventId: string): boolean {
  if (!userId) return false;
  return mutate((db) => {
    const idx = db.favorites.findIndex(
      (f) => f.userId === userId && f.eventId === eventId
    );
    if (idx >= 0) {
      db.favorites.splice(idx, 1);
      return false;
    }
    db.favorites.push({
      userId,
      eventId,
      createdAt: new Date().toISOString(),
    });
    return true;
  });
}

export function getFavoriteEvents(userId: string): ConcertEvent[] {
  const db = getDBValue();
  const ids = new Set(
    db.favorites.filter((f) => f.userId === userId).map((f) => f.eventId)
  );
  return db.events
    .filter((e) => ids.has(e.id) && e.status === "published")
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function getFavoriteCount(userId: string): number {
  if (!userId) return 0;
  return getDBValue().favorites.filter((f) => f.userId === userId).length;
}
