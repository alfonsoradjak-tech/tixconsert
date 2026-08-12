"use client";

import Link from "next/link";
import {
  Ticket,
  CalendarDays,
  Heart,
  ArrowRight,
  ReceiptText,
  Settings,
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store/auth-store";
import { useDB } from "@/lib/db";
import { getUserTickets } from "@/lib/services/order.service";
import { getFavoriteCount } from "@/lib/services/favorite.service";
import { getEventById } from "@/lib/services/event.service";
import { initialName } from "@/lib/utils";

export default function AccountOverviewPage() {
  const session = useAuthStore((s) => s.session);
  const db = useDB();

  if (!session) return null;
  const user = db.users.find((u) => u.id === session.id);
  const tickets = getUserTickets(session.id);
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = tickets.filter(
    (t) => (getEventById(t.eventId)?.date ?? "") >= today && t.status === "paid"
  ).length;
  const orders = db.orders.filter((o) => o.userId === session.id).length;
  const favorites = getFavoriteCount(session.id);

  const stats = [
    { label: "Active Tickets", value: upcoming, icon: Ticket, href: "/account/my-tickets" },
    { label: "Total Orders", value: orders, icon: ReceiptText, href: "/account/orders" },
    { label: "Favorites", value: favorites, icon: Heart, href: "/account/favorites" },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-brand text-xl font-black text-white">
            {initialName(session.name)}
          </span>
          <div>
            <CardTitle className="text-xl">{session.name}</CardTitle>
            <p className="text-sm text-muted">{session.email}</p>
            <p className="text-xs text-muted">{user?.phone}</p>
            <span className="mt-1.5 inline-block rounded-full bg-brand-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-300">
              {session.role}
            </span>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="flex items-center gap-4 p-5 transition-all hover:border-brand-500/40 hover:shadow-lg hover:shadow-brand-600/10">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-300">
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-display text-2xl font-black">{s.value}</p>
                <p className="text-xs text-muted">{s.label}</p>
              </div>
              <ArrowRight className="ml-auto h-4 w-4 text-muted" />
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <div className="flex flex-wrap gap-3 px-5 pb-5 sm:px-6 sm:pb-6">
          <Button href="/concerts">Explore Concerts</Button>
          <Button href="/account/my-tickets" variant="secondary">
            <CalendarDays className="h-4 w-4" /> My Tickets
          </Button>
          <Button href="/account/favorites" variant="secondary">
            <Heart className="h-4 w-4" /> Favorites
          </Button>
          <Button href="/account/settings" variant="secondary">
            <Settings className="h-4 w-4" /> Settings
          </Button>
        </div>
      </Card>
    </div>
  );
}
