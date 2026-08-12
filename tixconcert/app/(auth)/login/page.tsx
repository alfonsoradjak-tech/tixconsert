"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Lock, Mail, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label, FieldError } from "@/components/ui/input";
import { useAuthStore } from "@/lib/store/auth-store";
import { PageLoader } from "@/components/ui/spinner";
import { toast } from "sonner";

const schema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

type FormValues = z.infer<typeof schema>;

function GoogleButton() {
  return (
    <Button
      variant="secondary"
      className="w-full"
      onClick={() =>
        toast.info("OAuth Google akan tersedia saat backend terhubung.")
      }
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" fill="#34A853" />
        <path d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A11 11 0 0 0 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
      </svg>
      Login with Google
    </Button>
  );
}

function LoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((s) => s.login);
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    setSubmitting(true);
    const result = await login(data.email, data.password);
    setSubmitting(false);
    if (!result.ok) {
      toast.error(result.error ?? "Login gagal");
      return;
    }
    toast.success("Berhasil login!");
    const redirect = searchParams.get("redirect") ?? "/account";
    router.push(redirect);
    router.refresh();
  };

  const quickFill = (email: string, password: string) => {
    onSubmit({ email, password });
  };

  return (
    <Card className="animate-scale-in">
      <CardContent className="pt-8">
        <h1 className="text-center font-display text-2xl font-black">Welcome Back</h1>
        <p className="mt-1.5 text-center text-sm text-muted">
          Login untuk mengelola tiket dan favoritmu.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div>
            <Label>Email</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input
                type="email"
                placeholder="you@email.com"
                className="pl-10"
                {...register("email")}
              />
            </div>
            <FieldError message={errors.email?.message} />
          </div>
          <div>
            <Label>Password</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input
                type={showPw ? "text" : "password"}
                placeholder="••••••••"
                className="pl-10 pr-10"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                aria-label="Toggle password"
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <FieldError message={errors.password?.message} />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex cursor-pointer items-center gap-2 text-muted">
              <input type="checkbox" className="h-4 w-4 accent-brand-500" />
              Remember me
            </label>
            <Link href="/forgot-password" className="font-semibold text-brand-300 hover:underline">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" className="w-full" size="lg" loading={submitting}>
            Login
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs text-muted">
          <div className="h-px flex-1 bg-border" /> OR <div className="h-px flex-1 bg-border" />
        </div>

        <GoogleButton />

        <p className="mt-6 text-center text-sm text-muted">
          Belum punya akun?{" "}
          <Link href="/register" className="font-semibold text-brand-300 hover:underline">
            Register
          </Link>
        </p>

        <div className="mt-6 rounded-xl border border-brand-500/20 bg-brand-500/5 p-4">
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-brand-300">
            <Sparkles className="h-3.5 w-3.5" /> Akun demo
          </p>
          <div className="mt-2 space-y-1.5 text-xs text-muted">
            <button onClick={() => quickFill("user@tixconcert.com", "user123")} className="block w-full text-left hover:text-foreground">
              User: <span className="font-semibold">user@tixconcert.com / user123</span>
            </button>
            <button onClick={() => quickFill("admin@tixconcert.com", "admin123")} className="block w-full text-left hover:text-foreground">
              Admin: <span className="font-semibold">admin@tixconcert.com / admin123</span>
            </button>
            <button onClick={() => quickFill("staff@tixconcert.com", "staff123")} className="block w-full text-left hover:text-foreground">
              Staff: <span className="font-semibold">staff@tixconcert.com / staff123</span>
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <LoginInner />
    </Suspense>
  );
}
