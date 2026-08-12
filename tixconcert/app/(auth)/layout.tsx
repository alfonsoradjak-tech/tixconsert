import Link from "next/link";
import { Logo } from "@/components/layout/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-10">
      <div className="absolute inset-0 hero-grid opacity-50" />
      <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-brand-600/20 blur-[120px]" />
      <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-fuchsia-600/20 blur-[120px]" />
      <Link href="/" className="relative mb-8">
        <Logo size="lg" />
      </Link>
      <div className="relative w-full max-w-md">{children}</div>
      <p className="relative mt-8 text-xs text-muted">
        © {new Date().getFullYear()} TIXCONCERT · Your Gateway to Live Music
      </p>
    </div>
  );
}
