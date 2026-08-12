"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label, FieldError } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDB } from "@/lib/db";
import { toast } from "sonner";

const schema = z.object({
  email: z.string().email("Format email tidak valid"),
});

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const db = useDB();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ email: string }>({ resolver: zodResolver(schema) });

  const onSubmit = ({ email }: { email: string }) => {
    const exists = db.users.some((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!exists) {
      toast.error("Email tidak terdaftar.");
      return;
    }
    setSent(true);
  };

  return (
    <Card className="animate-scale-in">
      <CardContent className="pt-8">
        {sent ? (
          <div className="py-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15">
              <MailCheck className="h-8 w-8 text-emerald-400" />
            </div>
            <h1 className="mt-5 font-display text-2xl font-black">Email Terkirim!</h1>
            <p className="mt-2 text-sm text-muted">
              Kami sudah mengirimkan link reset password ke email kamu. Cek inbox atau
              folder spam.
            </p>
            <Button href="/login" className="mt-6">
              <ArrowLeft className="h-4 w-4" /> Back to Login
            </Button>
          </div>
        ) : (
          <>
            <h1 className="text-center font-display text-2xl font-black">Forgot Password</h1>
            <p className="mt-1.5 text-center text-sm text-muted">
              Masukkan email terdaftar untuk reset password.
            </p>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
              <div>
                <Label>Email</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                  <Input type="email" placeholder="you@email.com" className="pl-10" {...register("email")} />
                </div>
                <FieldError message={errors.email?.message} />
              </div>
              <Button type="submit" className="w-full" size="lg">
                Send Reset Link
              </Button>
            </form>
            <Link
              href="/login"
              className="mt-6 flex items-center justify-center gap-1.5 text-sm font-semibold text-brand-300 hover:underline"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Login
            </Link>
          </>
        )}
      </CardContent>
    </Card>
  );
}
