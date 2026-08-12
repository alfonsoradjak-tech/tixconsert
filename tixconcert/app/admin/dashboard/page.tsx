"use client";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Banknote,
  Ticket as TicketIcon,
  ReceiptText,
  Users,
  CalendarDays,
  Clock,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDB } from "@/lib/db";
import {
  adminStats,
  monthlySeries,
  categoryDistribution,
  paymentDistribution,
  topEvents,
} from "@/lib/services/stats.service";
import { eventLowestPrice, venueOf } from "@/lib/services/event.service";
import { formatIDR } from "@/lib/utils";
import { cn } from "@/lib/utils";

const PIE_COLORS = ["#8b5cf6", "#d946ef", "#fb923c", "#22d3ee", "#34d399", "#f472b6", "#facc15"];

function ChartTooltip({
  active,
  payload,
  label,
  currency,
}: {
  active?: boolean;
  payload?: { value: number; name: string; color?: string }[];
  label?: string;
  currency?: boolean;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-surface p-3 text-xs shadow-xl">
      <p className="mb-1 font-bold text-foreground">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-muted">
          {p.name}:{" "}
          <span className="font-bold text-foreground">
            {currency ? formatIDR(p.value) : p.value.toLocaleString("id-ID")}
          </span>
        </p>
      ))}
    </div>
  );
}

export default function AdminDashboardPage() {
  useDB();
  const stats = adminStats();
  const monthly = monthlySeries();
  const categories = categoryDistribution();
  const payments = paymentDistribution();
  const top = topEvents(5);

  const cards = [
    {
      label: "Total Revenue",
      value: formatIDR(stats.revenue),
      icon: Banknote,
      change: stats.revenueChange,
    },
    {
      label: "Tickets Sold",
      value: stats.ticketsSold.toLocaleString("id-ID"),
      icon: TicketIcon,
      change: stats.salesChange,
    },
    {
      label: "Total Orders",
      value: stats.orders.toLocaleString("id-ID"),
      icon: ReceiptText,
    },
    {
      label: "Total Users",
      value: stats.users.toLocaleString("id-ID"),
      icon: Users,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-black tracking-tight">Dashboard</h2>
          <p className="text-sm text-muted">
            Ringkasan performa platform ticketing TIXCONCERT.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1.5 text-muted">
            <CalendarDays className="h-3.5 w-3.5 text-brand-400" />
            {stats.upcomingEvents} upcoming events
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1.5 text-muted">
            <Clock className="h-3.5 w-3.5 text-amber-400" />
            {stats.pendingOrders} pending orders
          </span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                {c.label}
              </p>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/10 text-brand-300">
                <c.icon className="h-4.5 w-4.5" />
              </div>
            </div>
            <p className="mt-2 font-display text-2xl font-black">{c.value}</p>
            {c.change != null && (
              <p
                className={cn(
                  "mt-1 flex items-center gap-1 text-xs font-semibold",
                  c.change >= 0 ? "text-emerald-400" : "text-red-400"
                )}
              >
                {c.change >= 0 ? (
                  <TrendingUp className="h-3.5 w-3.5" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5" />
                )}
                {Math.abs(c.change)}% vs 30 hari terakhir
              </p>
            )}
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="mb-4 font-display text-base font-black">Revenue</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthly}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--muted)" fontSize={12} />
                <YAxis stroke="var(--muted)" fontSize={12} tickFormatter={(v) => `${Math.round(v / 1000000)}jt`} />
                <Tooltip content={<ChartTooltip currency />} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#8b5cf6" fill="url(#rev)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="mb-4 font-display text-base font-black">Ticket Sales</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--muted)" fontSize={12} />
                <YAxis stroke="var(--muted)" fontSize={12} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="tickets" name="Tickets" fill="#d946ef" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="mb-4 font-display text-base font-black">Orders</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--muted)" fontSize={12} />
                <YAxis stroke="var(--muted)" fontSize={12} />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="orders" name="Orders" stroke="#fb923c" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="mb-4 font-display text-base font-black">Users Growth</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--muted)" fontSize={12} />
                <YAxis stroke="var(--muted)" fontSize={12} />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="users" name="Users" stroke="#22d3ee" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5">
          <h3 className="mb-4 font-display text-base font-black">Sales by Category</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categories} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {categories.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {categories.slice(0, 5).map((c, i) => (
              <span key={c.name} className="flex items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-1 text-[10px] font-semibold text-muted">
                <span className="h-2 w-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                {c.name}
              </span>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="mb-4 font-display text-base font-black">Payment Methods</h3>
          <div className="space-y-3">
            {payments.map((p, i) => {
              const total = payments.reduce((s, x) => s + x.value, 0) || 1;
              return (
                <div key={p.name}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-semibold">{p.name}</span>
                    <span className="text-muted">{p.value} orders</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface-2">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(p.value / total) * 100}%`,
                        background: PIE_COLORS[i % PIE_COLORS.length],
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="mb-4 font-display text-base font-black">Top Events</h3>
          <div className="space-y-3">
            {top.map((t, i) => (
              <div key={t.event.id} className="flex items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-xs font-black text-muted">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{t.event.title}</p>
                  <p className="text-xs text-muted">
                    {t.sold} sold · {venueOf(t.event)?.city}
                  </p>
                </div>
                <span className="text-sm font-bold text-brand-300">
                  {formatIDR(eventLowestPrice(t.event))}+
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
