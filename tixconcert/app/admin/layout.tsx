"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Ticket as TicketIcon,
  ReceiptText,
  Users,
  Tag,
  ScanLine,
  Menu,
  X,
  ExternalLink,
  LogOut,
  ShieldAlert,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/auth-store";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { PageLoader } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/events", label: "Events", icon: CalendarDays },
  { href: "/admin/tickets", label: "Tickets", icon: TicketIcon },
  { href: "/admin/orders", label: "Orders", icon: ReceiptText },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/promos", label: "Promos", icon: Tag },
  { href: "/admin/scanner", label: "Scanner", icon: ScanLine },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = useAuthStore((s) => s.session);
  const hydrate = useAuthStore((s) => s.hydrate);
  const logout = useAuthStore((s) => s.logout);
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!session) {
      router.replace("/login?redirect=/admin/dashboard");
    }
  }, [session, router]);

  if (!session) return <PageLoader />;

  const isAdmin = session.role === "admin" || session.role === "staff";

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/30">
          <ShieldAlert className="h-8 w-8 text-red-400" />
        </div>
        <h1 className="mt-5 font-display text-2xl font-black">Akses Ditolak</h1>
        <p className="mt-2 max-w-sm text-sm text-muted">
          Halaman ini khusus untuk admin dan staff TIXCONCERT.
        </p>
        <Link
          href="/"
          className="mt-6 rounded-xl bg-gradient-brand px-6 py-3 text-sm font-bold text-white"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border bg-surface lg:flex">
        <div className="flex h-16 items-center border-b border-border px-5">
          <Link href="/admin/dashboard">
            <Logo />
          </Link>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {nav.map((n) => {
            const active = pathname.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors",
                  active
                    ? "bg-brand-500/10 text-brand-300 border border-brand-500/30"
                    : "text-muted hover:bg-surface-2 hover:text-foreground border border-transparent"
                )}
              >
                <n.icon className="h-4.5 w-4.5" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="space-y-1 border-t border-border p-3">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            <ExternalLink className="h-4.5 w-4.5" /> View Site
          </Link>
          <button
            onClick={() => {
              logout();
              router.push("/login");
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/10"
          >
            <LogOut className="h-4.5 w-4.5" /> Logout
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-xl sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface lg:hidden"
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="font-display text-lg font-black">
              Admin <span className="text-gradient">Panel</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <span className="hidden rounded-full bg-brand-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-300 sm:block">
              {session.role}
            </span>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 border-r border-border bg-surface animate-slide-in">
            <div className="flex h-16 items-center justify-between border-b border-border px-5">
              <Logo />
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-full p-1.5 text-muted hover:text-foreground"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="space-y-1 p-3">
              {nav.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold",
                    pathname.startsWith(n.href)
                      ? "bg-brand-500/10 text-brand-300"
                      : "text-muted hover:bg-surface-2 hover:text-foreground"
                  )}
                >
                  <n.icon className="h-4.5 w-4.5" /> {n.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
