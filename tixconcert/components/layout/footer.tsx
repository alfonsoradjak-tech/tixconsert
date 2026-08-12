import Link from "next/link";
import type { SVGProps } from "react";
import {
  MapPin,
  Mail,
  Phone,
} from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { NewsletterForm } from "@/components/layout/newsletter";

const InstagramIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const FacebookIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const TikTokIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

const XIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const footerMenus: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Help Center", href: "/help" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms & Conditions", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Refund Policy", href: "/refund-policy" },
    ],
  },
  {
    title: "Explore",
    links: [
      { label: "Concerts", href: "/concerts" },
      { label: "Events", href: "/events" },
      { label: "Categories", href: "/categories" },
      { label: "Search", href: "/search" },
    ],
  },
];

const socials = [
  { icon: InstagramIcon, label: "Instagram" },
  { icon: FacebookIcon, label: "Facebook" },
  { icon: TikTokIcon, label: "TikTok" },
  { icon: XIcon, label: "X" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo />
            <p className="mt-3 text-sm text-muted">
              Your Gateway to Live Music.
            </p>
            <p className="mt-2 max-w-sm text-sm text-muted/80">
              Temukan konser favoritmu, pilih tiket terbaik, dan rasakan musik
              secara langsung. Pengalaman memesan tiket yang cepat, aman, dan
              mudah.
            </p>
            <div className="mt-5 flex items-center gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href="#"
                  aria-label={s.label}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-border text-muted transition-all hover:border-brand-500/40 hover:text-foreground hover:-translate-y-0.5"
                >
                  <s.icon className="h-4.5 w-4.5" />
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-5">
            {footerMenus.map((m) => (
              <div key={m.title}>
                <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-foreground">
                  {m.title}
                </h4>
                <ul className="space-y-2">
                  {m.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        className="text-sm text-muted transition-colors hover:text-foreground"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="lg:col-span-3">
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-foreground">
              Newsletter
            </h4>
            <p className="mb-3 text-sm text-muted">
              Get the latest concert updates.
            </p>
            <NewsletterForm />
            <div className="mt-5 space-y-2 text-sm text-muted">
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-brand-400" /> Jakarta, Indonesia
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-brand-400" /> hello@tixconcert.com
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-brand-400" /> +62 21 5550 1122
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 sm:flex-row">
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} TIXCONCERT. All rights reserved.
          </p>
          <p className="text-xs text-muted">
            Made with passion for live music.
          </p>
        </div>
      </div>
    </footer>
  );
}
