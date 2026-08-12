"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Ticket as TicketIcon } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { SiteSearch } from "@/components/layout/site-search";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store/auth-store";
import { useBookingStore } from "@/lib/store/booking-store";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/concerts", label: "Concert" },
  { href: "/events", label: "Event" },
  { href: "/categories", label: "Categories" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const session = useAuthStore((s) => s.session);
  const itemCount = useBookingStore((s) =>
    s.items.reduce((acc, i) => acc + i.qty, 0)
  );

  const inAdmin = pathname.startsWith("/admin");
  const inAuth = pathname.startsWith("/login") || pathname.startsWith("/register");

  if (inAdmin || inAuth) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="TIXCONCERT Home">
          <Logo />
        </Link>

        <nav className="ml-6 hidden items-center gap-1 lg:flex">
          {navLinks.map((l) => {
            const active =
              l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                  active
                    ? "text-foreground bg-surface-2"
                    : "text-muted hover:text-foreground hover:bg-surface-2/60"
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto hidden flex-1 max-w-md md:block">
          <SiteSearch />
        </div>

        <div className="ml-auto flex items-center gap-2 md:ml-4">
          <div className="md:hidden">
            <SiteSearch className="w-40" />
          </div>

          <Link
            href={itemCount > 0 ? "/buy/checkout" : "/concerts"}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-muted transition-all hover:border-brand-500/40 hover:text-foreground"
            aria-label="Cart"
          >
            <TicketIcon className="h-4.5 w-4.5" />
            {itemCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-brand px-1 text-[10px] font-bold text-white">
                {itemCount}
              </span>
            )}
          </Link>

          <ThemeToggle />

          {session ? (
            <UserMenu />
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button href="/login" variant="ghost" size="sm">
                Login
              </Button>
              <Button href="/register" size="sm">
                Register
              </Button>
            </div>
          )}

          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-foreground lg:hidden"
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-background/95 backdrop-blur-xl lg:hidden animate-fade-in">
          <nav className="mx-auto max-w-7xl space-y-1 px-4 py-4">
            {navLinks.map((l) => {
              const active =
                l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "block rounded-xl px-4 py-3 text-sm font-semibold transition-colors",
                    active
                      ? "bg-surface-2 text-foreground"
                      : "text-muted hover:bg-surface-2/60 hover:text-foreground"
                  )}
                >
                  {l.label}
                </Link>
              );
            })}
            {!session && (
              <div className="flex gap-2 pt-3">
                <Button href="/login" variant="secondary" className="flex-1">
                  Login
                </Button>
                <Button href="/register" className="flex-1">
                  Register
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
