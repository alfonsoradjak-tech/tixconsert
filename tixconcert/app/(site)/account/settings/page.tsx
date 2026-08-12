"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, KeyRound, Settings as SettingsIcon } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldError } from "@/components/ui/input";
import { useAuthStore } from "@/lib/store/auth-store";
import { useDB } from "@/lib/db";
import { updateProfile, changePassword } from "@/lib/services/auth.service";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const profileSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  email: z.string().email("Format email tidak valid"),
  phone: z.string().min(9, "Nomor HP minimal 9 digit"),
});

const passwordSchema = z
  .object({
    current: z.string().min(6, "Password minimal 6 karakter"),
    newPassword: z.string().min(6, "Password baru minimal 6 karakter"),
    confirm: z.string().min(6, "Konfirmasi password minimal 6 karakter"),
  })
  .refine((d) => d.newPassword === d.confirm, {
    message: "Password baru tidak cocok",
    path: ["confirm"],
  });

export default function SettingsPage() {
  const session = useAuthStore((s) => s.session);
  const db = useDB();
  const { resolvedTheme, setTheme } = useTheme();
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const user = db.users.find((u) => u.id === session?.id);

  const profile = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
    },
  });

  const pwForm = useForm({ resolver: zodResolver(passwordSchema) });

  if (!session || !user) return null;

  const onProfile = async (data: z.infer<typeof profileSchema>) => {
    setSaving(true);
    const res = updateProfile(user.id, data);
    setSaving(false);
    if (res.ok) toast.success("Profil berhasil diperbarui");
    else toast.error(res.error ?? "Gagal memperbarui profil");
  };

  const onPassword = async (data: z.infer<typeof passwordSchema>) => {
    setSavingPw(true);
    await changePassword(user.id, data.newPassword);
    setSavingPw(false);
    pwForm.reset();
    toast.success("Password berhasil diubah");
  };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-xl font-black">Settings</h2>

      <Card>
        <CardHeader className="flex items-center gap-2">
          <SettingsIcon className="h-5 w-5 text-brand-400" />
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <form
          onSubmit={profile.handleSubmit(onProfile)}
          className="space-y-4 px-5 pb-5 sm:px-6 sm:pb-6"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Full Name</Label>
              <Input {...profile.register("name")} />
              <FieldError message={profile.formState.errors.name?.message} />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" {...profile.register("email")} />
              <FieldError message={profile.formState.errors.email?.message} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input type="tel" {...profile.register("phone")} />
              <FieldError message={profile.formState.errors.phone?.message} />
            </div>
          </div>
          <Button type="submit" loading={saving}>
            <Save className="h-4 w-4" /> Save Profile
          </Button>
        </form>
      </Card>

      <Card>
        <CardHeader className="flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-brand-400" />
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <form
          onSubmit={pwForm.handleSubmit(onPassword)}
          className="space-y-4 px-5 pb-5 sm:px-6 sm:pb-6"
        >
          <div>
            <Label>Current Password</Label>
            <Input type="password" {...pwForm.register("current")} />
            <FieldError message={pwForm.formState.errors.current?.message} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>New Password</Label>
              <Input type="password" {...pwForm.register("newPassword")} />
              <FieldError message={pwForm.formState.errors.newPassword?.message} />
            </div>
            <div>
              <Label>Confirm New Password</Label>
              <Input type="password" {...pwForm.register("confirm")} />
              <FieldError message={pwForm.formState.errors.confirm?.message} />
            </div>
          </div>
          <Button type="submit" variant="secondary" loading={savingPw}>
            <KeyRound className="h-4 w-4" /> Update Password
          </Button>
        </form>
      </Card>

      <Card>
        <CardHeader className="flex items-center gap-2">
          <SettingsIcon className="h-5 w-5 text-brand-400" />
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <div className="px-5 pb-5 sm:px-6 sm:pb-6">
          <div className="flex gap-2">
            {[
              { key: "light", label: "Light" },
              { key: "dark", label: "Dark" },
            ].map((m) => (
              <button
                key={m.key}
                onClick={() => setTheme(m.key)}
                className={cn(
                  "rounded-xl border px-5 py-2.5 text-sm font-semibold transition-all",
                  resolvedTheme === m.key
                    ? "border-brand-500 bg-brand-500/10 text-brand-300"
                    : "border-border text-muted hover:text-foreground"
                )}
              >
                {m.label} Mode
              </button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
