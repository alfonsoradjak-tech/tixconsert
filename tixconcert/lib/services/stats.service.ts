import { getDBValue } from "@/lib/db";
import { eventTotalSold } from "@/lib/services/event.service";

export interface AdminStats {
  revenue: number;
  ticketsSold: number;
  orders: number;
  users: number;
  upcomingEvents: number;
  pendingOrders: number;
  revenueChange: number;
  salesChange: number;
}

export function adminStats(): AdminStats {
  const db = getDBValue();
  const paid = db.orders.filter((o) => o.status === "paid");
  const prev = db.orders.filter(
    (o) =>
      o.status === "paid" &&
      new Date(o.paidAt ?? o.createdAt).getTime() <
        Date.now() - 30 * 86400000
  );
  const revenue = paid.reduce((s, o) => s + o.total, 0);
  const prevRevenue = prev.reduce((s, o) => s + o.total, 0);
  const revenueChange =
    prevRevenue > 0 ? Math.round(((revenue - prevRevenue) / prevRevenue) * 100) : 0;

  const ticketsSold = db.tickets.filter((t) => t.status === "paid" || t.status === "used").length;
  const prevTickets = db.tickets.filter(
    (t) => t.status === "paid" || t.status === "used"
  ).length;
  const salesChange =
    prevTickets > 0 ? Math.round(((ticketsSold - prevTickets) / prevTickets) * 100) : 0;

  const today = new Date().toISOString().slice(0, 10);
  return {
    revenue,
    ticketsSold,
    orders: db.orders.length,
    users: db.users.filter((u) => u.role === "user").length,
    upcomingEvents: db.events.filter(
      (e) => e.status === "published" && e.date >= today
    ).length,
    pendingOrders: db.orders.filter((o) => o.status === "pending").length,
    revenueChange,
    salesChange,
  };
}

export interface MonthPoint {
  month: string;
  revenue: number;
  tickets: number;
  orders: number;
  users: number;
}

const MONTH_KEYS = 8;

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function monthlySeries(): MonthPoint[] {
  const db = getDBValue();
  const points: MonthPoint[] = [];
  const now = new Date();
  for (let i = MONTH_KEYS - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = monthKey(d);
    points.push({
      month: key,
      revenue: 0,
      tickets: 0,
      orders: 0,
      users: 0,
    });
  }
  const fmtMonth = (iso: string) => monthKey(new Date(iso));

  for (const o of db.orders) {
    const idx = points.findIndex((p) => p.month === fmtMonth(o.paidAt ?? o.createdAt));
    if (idx >= 0) {
      if (o.status === "paid") {
        points[idx].revenue += o.total;
        points[idx].orders += 1;
        points[idx].tickets += o.items.reduce((s, i) => s + i.quantity, 0);
      }
    }
  }
  for (const u of db.users) {
    const idx = points.findIndex((p) => p.month === fmtMonth(u.createdAt + "T00:00:00"));
    if (idx >= 0) points[idx].users += 1;
  }
  return points.map((p) => ({
    ...p,
    month: new Date(p.month + "-01")
      .toLocaleString("en", { month: "short" })
      .slice(0, 3),
  }));
}

export function categoryDistribution() {
  const db = getDBValue();
  const map = new Map<string, number>();
  for (const e of db.events) {
    map.set(e.category, (map.get(e.category) ?? 0) + eventTotalSold(e));
  }
  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export function paymentDistribution() {
  const db = getDBValue();
  const map = new Map<string, number>();
  for (const o of db.orders) {
    if (o.status !== "paid") continue;
    const label = o.paymentMethod.replace("_", " ").toUpperCase();
    map.set(label, (map.get(label) ?? 0) + 1);
  }
  return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
}

export function ticketStatusDistribution() {
  const db = getDBValue();
  const map = new Map<string, number>();
  for (const t of db.tickets) {
    map.set(t.status, (map.get(t.status) ?? 0) + 1);
  }
  return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
}

export function topEvents(limit = 5) {
  const db = getDBValue();
  return db.events
    .filter((e) => e.status === "published")
    .map((e) => ({
      event: e,
      sold: eventTotalSold(e),
      revenue: e.ticketCategories.reduce(
        (s, c) => s + c.sold * c.price,
        0
      ),
      views: e.views,
    }))
    .sort((a, b) => b.sold - a.sold)
    .slice(0, limit);
}
