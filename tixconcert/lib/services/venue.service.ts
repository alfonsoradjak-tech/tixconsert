import { getDBValue } from "@/lib/db";
import type { Venue } from "@/lib/types";

export function getVenueById(id: string): Venue | undefined {
  return getDBValue().venues.find((v) => v.id === id);
}

export function getAllVenues(): Venue[] {
  return getDBValue().venues;
}
