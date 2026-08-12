"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  User,
  Ticket,
  ReceiptText,
  Heart,
  Bell,
  Settings,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/auth-store";
import { cn } from "@/lib/utils";
import { PageLoader } from "@/components/ui/spinner";
import { initialName } from "@/lib/utils";

const nav = [
  { href: "/account", label: "Profile", icon: User },
  { href: "/account/my-tickets", label: "My Tickets", icon: Ticket },
  { href: "/account/orders", label: "Order History", icon: ReceiptText },
  { href: "/account/favorites", label: "Favorites", icon: Heart },
  { href: "/account/notifications", label: "Notifications", icon: Bell },
  { href: "/account/settings", label: "Settings", icon: Settings },
];

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = useAuthStore((s) => s.session);
  const hydrate = useAuthStore((s) => s.hydrate);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!session) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [session, pathname, router]);

  if (!session) return <PageLoader />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-black tracking-tight">
          My <span className="text-gradient">Account</span>
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside>
          <div className="mb-4 flex items-center gap-3 rounded-2xl border border-border bg-card p-4 lg:hidden">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-brand text-sm font-bold text-white">
              {initialName(session.name)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{session.name}</p>
              <p className="truncate text-xs text-muted">{session.email}</p>
            </div>
          </div>
          <nav className="no-scrollbar flex gap-1 overflow-x-auto lg:flex-col">
            {nav.map((n) => {
              const active =
                n.href === "/account"
                  ? pathname === "/account"
                  : pathname.startsWith(n.href);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={cn(
                    "flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors",
                    active
                      ? "bg-brand-500/10 text-brand-300 border border-brand-500/30"
                      : "text-muted hover:bg-surface-2 hover:text-foreground border border-transparent"
                  )}
                >
                  <n.icon className="h-4 w-4" />
                  {n.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
