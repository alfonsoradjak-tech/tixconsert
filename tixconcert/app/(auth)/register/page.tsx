"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Lock, Mail, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label, FieldError } from "@/components/ui/input";
import { useAuthStore } from "@/lib/store/auth-store";
import { toast } from "sonner";

const schema = z
  .object({
    name: z.string().min(3, "Nama lengkap minimal 3 karakter"),
    email: z.string().email("Format email tidak valid"),
    phone: z.string().min(9, "Nomor HP minimal 9 digit"),
    password: z.string().min(6, "Password minimal 6 karakter"),
    confirm: z.string().min(6, "Konfirmasi password minimal 6 karakter"),
    terms: z.boolean().refine((v) => v, "Setujui syarat & ketentuan"),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Password tidak cocok",
    path: ["confirm"],
  });

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const register = useAuthStore((s) => s.register);
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register: reg,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    setSubmitting(true);
    const result = await register({
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: data.password,
    });
    setSubmitting(false);
    if (!result.ok) {
      toast.error(result.error ?? "Pendaftaran gagal");
      return;
    }
    toast.success("Akun berhasil dibuat! Selamat datang.");
    router.push("/account");
    router.refresh();
  };

  return (
    <Card className="animate-scale-in">
      <CardContent className="pt-8">
        <h1 className="text-center font-display text-2xl font-black">Create Account</h1>
        <p className="mt-1.5 text-center text-sm text-muted">
          Daftar gratis dan mulai beli tiket konser.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div>
            <Label>Full Name</Label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input placeholder="Nama lengkap" className="pl-10" {...reg("name")} />
            </div>
            <FieldError message={errors.name?.message} />
          </div>
          <div>
            <Label>Email</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input type="email" placeholder="you@email.com" className="pl-10" {...reg("email")} />
            </div>
            <FieldError message={errors.email?.message} />
          </div>
          <div>
            <Label>Phone</Label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input type="tel" placeholder="08xxxxxxxxxx" className="pl-10" {...reg("phone")} />
            </div>
            <FieldError message={errors.phone?.message} />
          </div>
          <div>
            <Label>Password</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input
                type={showPw ? "text" : "password"}
                placeholder="Minimal 6 karakter"
                className="pl-10 pr-10"
                {...reg("password")}
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
          <div>
            <Label>Confirm Password</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input type={showPw ? "text" : "password"} placeholder="Ulangi password" className="pl-10" {...reg("confirm")} />
            </div>
            <FieldError message={errors.confirm?.message} />
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-3">
            <input type="checkbox" className="mt-0.5 h-4 w-4 accent-brand-500" {...reg("terms")} />
            <span className="text-xs text-muted">
              Saya menyetujui{" "}
              <Link href="/terms" className="text-brand-300 hover:underline">Syarat & Ketentuan</Link>{" "}
              dan{" "}
              <Link href="/privacy" className="text-brand-300 hover:underline">Kebijakan Privasi</Link>.
            </span>
          </label>
          <FieldError message={errors.terms?.message} />

          <Button type="submit" className="w-full" size="lg" loading={submitting}>
            Register
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Sudah punya akun?{" "}
          <Link href="/login" className="font-semibold text-brand-300 hover:underline">
            Login
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
