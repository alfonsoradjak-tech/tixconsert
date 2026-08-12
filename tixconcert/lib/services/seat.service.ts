import { getDBValue } from "@/lib/db";
import type { ConcertEvent, SeatOption, SeatStatus } from "@/lib/types";

export function buildSeats(event: ConcertEvent): SeatOption[] {
  const db = getDBValue();
  if (!event.seatMap) return [];
  const seats: SeatOption[] = [];
  const claimed = new Map<string, SeatStatus>();

  for (const order of db.orders) {
    if (order.eventId !== event.id) continue;
    const status: SeatStatus =
      order.status === "pending"
        ? "reserved"
        : order.status === "paid"
          ? "sold"
          : "available";
    if (status === "available") continue;
    for (const item of order.items) {
      for (const seat of item.seats) {
        claimed.set(seat, status);
      }
    }
  }

  for (const section of event.seatMap.sections) {
    const cat = event.ticketCategories.find((c) => c.sectionId === section.id);
    for (const row of section.rows) {
      for (let n = 1; n <= section.cols; n += 1) {
        const label = `${row}${n}`;
        const status = claimed.get(label) ?? "available";
        seats.push({
          id: `seat_${event.id}_${section.id}_${label}`,
          eventId: event.id,
          sectionId: section.id,
          row,
          number: n,
          price: cat?.price ?? 0,
          status,
          label,
        });
      }
    }
  }
  return seats;
}

export function seatsInSection(
  seats: SeatOption[],
  sectionId: string
): SeatOption[] {
  return seats.filter((s) => s.sectionId === sectionId);
}

export function seatCountByStatus(
  seats: SeatOption[],
  status: SeatStatus
): number {
  return seats.filter((s) => s.status === status).length;
}
