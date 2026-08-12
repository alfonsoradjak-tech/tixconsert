"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  Heart,
  LayoutDashboard,
  LogOut,
  Settings,
  Ticket,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/auth-store";
import { initialName } from "@/lib/utils";
import { useDB } from "@/lib/db";
import { unreadCount } from "@/lib/services/notification.service";

export function UserMenu() {
  const session = useAuthStore((s) => s.session);
  const logout = useAuthStore((s) => s.logout);
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const db = useDB();

  useEffect(() => {
    if (session) setUnread(unreadCount(session.id));
  }, [session, db.version]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!session) return null;

  const isAdmin = session.role === "admin" || session.role === "staff";

  const links = [
    { href: "/account", label: "My Tickets", icon: Ticket },
    { href: "/account/favorites", label: "My Favorites", icon: Heart },
    { href: "/account/notifications", label: "Notifications", icon: LayoutDashboard, badge: unread },
    { href: "/account/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-xl border border-border bg-surface px-2 py-1.5 transition-colors hover:border-brand-500/40"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-brand text-xs font-bold text-white">
          {initialName(session.name)}
        </span>
        <span className="hidden text-sm font-semibold md:block">
          {session.name.split(" ")[0]}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-muted transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl animate-scale-in">
          <div className="border-b border-border p-4">
            <p className="truncate text-sm font-bold">{session.name}</p>
            <p className="truncate text-xs text-muted">{session.email}</p>
            <span className="mt-2 inline-block rounded-full bg-brand-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-300">
              {session.role}
            </span>
          </div>
          <div className="p-1.5">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
              >
                <l.icon className="h-4 w-4" />
                {l.label}
                {!!l.badge && (
                  <span className="ml-auto rounded-full bg-brand-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {l.badge}
                  </span>
                )}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin/dashboard"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
              >
                <LayoutDashboard className="h-4 w-4" /> Admin Panel
              </Link>
            )}
            <button
              onClick={() => {
                setOpen(false);
                logout();
                router.push("/");
                router.refresh();
              }}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
