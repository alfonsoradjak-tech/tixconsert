"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Building2,
  CreditCard,
  Smartphone,
  QrCode,
  Ticket as TicketIcon,
  ArrowRight,
  Lock,
  Tag,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Stepper } from "@/components/ui/stepper";
import { Input, Label, FieldError } from "@/components/ui/input";
import { useDB } from "@/lib/db";
import { getEventById, artistOf, venueOf } from "@/lib/services/event.service";
import {
  createOrder,
  validatePromo,
  serviceFeeFor,
  paymentFeeFor,
} from "@/lib/services/order.service";
import { useBookingStore } from "@/lib/store/booking-store";
import { useAuthStore } from "@/lib/store/auth-store";
import { formatIDR, formatDate, cn } from "@/lib/utils";
import { toast } from "sonner";
import type { PaymentMethod } from "@/lib/types";

const schema = z.object({
  name: z.string().min(3, "Nama lengkap minimal 3 karakter"),
  email: z.string().email("Format email tidak valid"),
  phone: z.string().min(9, "Nomor HP minimal 9 digit"),
  agree: z.boolean().refine((v) => v, "Setujui syarat & ketentuan untuk lanjut"),
});

type FormValues = z.infer<typeof schema>;

const methods: { value: PaymentMethod; label: string; desc: string; icon: typeof Building2 }[] = [
  { value: "bank_transfer", label: "Bank Transfer", desc: "Transfer manual ke rekening bank", icon: Building2 },
  { value: "virtual_account", label: "Virtual Account", desc: "Pembayaran otomatis via VA", icon: CreditCard },
  { value: "ewallet", label: "E-Wallet", desc: "OVO, GoPay, Dana, ShopeePay", icon: Smartphone },
  { value: "qris", label: "QRIS", desc: "Scan QR dari aplikasi apa pun", icon: QrCode },
  { value: "credit_card", label: "Credit / Debit Card", desc: "Visa, Mastercard, JCB", icon: CreditCard },
];

export default function CheckoutPage() {
  const db = useDB();
  const router = useRouter();
  const session = useAuthStore((s) => s.session);
  const dbUser = db.users.find((u) => u.id === session?.id);

  const booking = useBookingStore();
  const event = booking.eventId ? getEventById(booking.eventId) : undefined;

  const [promoCode, setPromoCode] = useState(booking.promoCode);
  const [discount, setDiscount] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState("");
  const [promoError, setPromoError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: booking.customer.name || dbUser?.name || "",
      email: booking.customer.email || dbUser?.email || "",
      phone: booking.customer.phone || dbUser?.phone || "",
      agree: false,
    },
  });

  useEffect(() => {
    setValue("name", booking.customer.name || dbUser?.name || "");
    setValue("email", booking.customer.email || dbUser?.email || "");
    setValue("phone", booking.customer.phone || dbUser?.phone || "");
  }, [dbUser, booking.customer, setValue]);

  const method = booking.method;
  const items = booking.items;

  const { subtotal, total, serviceFee, paymentFee } = useMemo(() => {
    if (!event) return { subtotal: 0, serviceFee: 0, paymentFee: 0, total: 0 };
    const sub = items.reduce((sum, i) => {
      const cat = event.ticketCategories.find((c) => c.id === i.ticketCategoryId);
      return sum + (cat ? cat.price * i.qty : 0);
    }, 0);
    const sf = serviceFeeFor(sub);
    const pf = paymentFeeFor(method, sub);
    const disc = appliedPromo ? discount : 0;
    return { subtotal: sub, serviceFee: sf, paymentFee: pf, total: sub + sf + pf - disc };
  }, [event, items, method, appliedPromo, discount]);

  if (!session) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-brand-soft border border-brand-500/20">
          <Lock className="h-8 w-8 text-brand-400" />
        </div>
        <h1 className="mt-5 font-display text-2xl font-black">Login Required</h1>
        <p className="mt-2 text-sm text-muted">
          Kamu perlu login terlebih dahulu untuk melanjutkan pembelian tiket.
        </p>
        <Button href="/login" className="mt-6">
          Login to Continue
        </Button>
      </div>
    );
  }

  if (!event || items.length === 0) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-brand-soft border border-brand-500/20">
          <TicketIcon className="h-8 w-8 text-brand-400" />
        </div>
        <h1 className="mt-5 font-display text-2xl font-black">Booking Kosong</h1>
        <p className="mt-2 text-sm text-muted">
          Kamu belum memilih tiket. Pilih konser favoritmu terlebih dahulu.
        </p>
        <Button href="/concerts" className="mt-6">
          Explore Concerts
        </Button>
      </div>
    );
  }

  const applyPromo = () => {
    if (!promoCode.trim()) return;
    const res = validatePromo(promoCode, subtotal);
    if (res.valid) {
      setDiscount(res.discount ?? 0);
      setAppliedPromo(promoCode.trim().toUpperCase());
      setPromoError("");
      booking.setPromo(promoCode.trim().toUpperCase());
      toast.success(`Voucher ${promoCode.toUpperCase()} diterapkan`);
    } else {
      setAppliedPromo("");
      setDiscount(0);
      booking.setPromo("");
      setPromoError(res.error ?? "Kode tidak valid");
    }
  };

  const onSubmit = async (data: FormValues) => {
    setSubmitting(true);
    booking.setCustomer(data);
    const result = createOrder({
      userId: session.id,
      event,
      customer: { name: data.name, email: data.email, phone: data.phone },
      items: items.map((i) => ({
        ticketCategoryId: i.ticketCategoryId,
        qty: i.qty,
        seats: i.seats,
      })),
      method,
      promoCode: appliedPromo || undefined,
    });
    setSubmitting(false);
    if (!result.ok || !result.order) {
      toast.error(result.error ?? "Gagal membuat order");
      return;
    }
    booking.complete({
      orderId: result.order.orderId,
      total: result.order.total,
      deadline: result.deadline ?? Date.now() + 86400000,
      method,
      eventTitle: event.title,
      eventSlug: event.slug,
    });
    router.push("/buy/payment");
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Stepper
          current={2}
          steps={[
            { label: "Select Ticket", done: true },
            { label: "Select Seat", done: true },
            { label: "Checkout" },
            { label: "Payment" },
          ]}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card className="p-5 sm:p-6">
            <h2 className="font-display text-lg font-black">Personal Information</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label>Nama Lengkap</Label>
                <Input
                  placeholder="Nama sesuai KTP"
                  {...register("name")}
                />
                <FieldError message={errors.name?.message} />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  {...register("email")}
                />
                <FieldError message={errors.email?.message} />
              </div>
              <div>
                <Label>Nomor HP</Label>
                <Input
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  {...register("phone")}
                />
                <FieldError message={errors.phone?.message} />
              </div>
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <h2 className="font-display text-lg font-black">Payment Method</h2>
            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {methods.map((m) => {
                const active = method === m.value;
                return (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => {
                      booking.setMethod(m.value);
                    }}
                    className={cn(
                      "flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all",
                      active
                        ? "border-brand-500/60 bg-brand-500/10 ring-2 ring-brand-500/20"
                        : "border-border bg-surface hover:border-brand-500/30"
                    )}
                  >
                    <m.icon
                      className={cn(
                        "h-5 w-5 shrink-0",
                        active ? "text-brand-300" : "text-muted"
                      )}
                    />
                    <div>
                      <p className="text-sm font-bold">{m.label}</p>
                      <p className="text-xs text-muted">{m.desc}</p>
                    </div>
                    {active && (
                      <CheckCircle2 className="ml-auto h-5 w-5 shrink-0 text-brand-300" />
                    )}
                  </button>
                );
              })}
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <h2 className="flex items-center gap-2 font-display text-lg font-black">
              <Tag className="h-5 w-5 text-brand-400" /> Promo / Voucher
            </h2>
            <div className="mt-4 flex gap-2">
              <Input
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="Masukkan kode voucher"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={applyPromo}
                disabled={!promoCode.trim()}
              >
                Apply
              </Button>
            </div>
            {promoError && <p className="mt-2 text-xs text-red-400">{promoError}</p>}
            {appliedPromo && (
              <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                <CheckCircle2 className="h-4 w-4" /> {appliedPromo} applied — diskon{" "}
                {formatIDR(discount)}
              </p>
            )}
            <p className="mt-3 rounded-xl bg-surface-2 p-3 text-xs text-muted">
              Coba kode demo: <span className="font-bold text-brand-300">CONCERT2026</span>{" "}
              (20% diskon, max Rp100.000) atau{" "}
              <span className="font-bold text-brand-300">WELCOME10</span> (10% diskon).
            </p>
          </Card>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-card p-4">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 accent-brand-500"
              {...register("agree")}
            />
            <span className="text-sm text-muted">
              Saya menyetujui{" "}
              <a href="/terms" className="text-brand-300 hover:underline">
                Syarat & Ketentuan
              </a>{" "}
              dan{" "}
              <a href="/privacy" className="text-brand-300 hover:underline">
                Kebijakan Privasi
              </a>{" "}
              TIXCONCERT.
            </span>
          </label>
          {errors.agree && (
            <p className="text-xs text-red-400">{errors.agree.message}</p>
          )}
        </form>

        <div>
          <div className="lg:sticky lg:top-24 space-y-4">
            <Card className="overflow-hidden">
              {event && (
                <>
                  <div className="relative h-28">
                    <Image
                      src={event.poster}
                      alt={event.title}
                      fill
                      sizes="400px"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-3 left-4 right-4">
                      <p className="font-display text-sm font-black text-white">
                        {event.title}
                      </p>
                      <p className="text-xs text-white/70">
                        {formatDate(event.date)} · {artistOf(event)?.name}
                      </p>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="space-y-2.5 text-sm">
                      {items.map((i) => {
                        const cat = event.ticketCategories.find(
                          (c) => c.id === i.ticketCategoryId
                        );
                        return (
                          <div
                            key={i.ticketCategoryId}
                            className="flex items-center justify-between"
                          >
                            <span className="text-muted">
                              {cat?.name} × {i.qty}
                            </span>
                            <span className="font-semibold">
                              {formatIDR((cat?.price ?? 0) * i.qty)}
                            </span>
                          </div>
                        );
                      })}
                      {items
                        .filter((i) => i.seats.length > 0)
                        .map((i) => (
                          <div
                            key={`${i.ticketCategoryId}-seat`}
                            className="flex items-center justify-between text-xs text-muted"
                          >
                            <span>Seats</span>
                            <span className="font-semibold text-foreground">
                              {i.seats.join(", ")}
                            </span>
                          </div>
                        ))}
                    </div>
                    <div className="mt-4 space-y-2 border-t border-border pt-3 text-sm">
                      <div className="flex justify-between text-muted">
                        <span>Subtotal</span>
                        <span>{formatIDR(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-muted">
                        <span>Service Fee</span>
                        <span>{formatIDR(serviceFee)}</span>
                      </div>
                      <div className="flex justify-between text-muted">
                        <span>Payment Fee</span>
                        <span>{formatIDR(paymentFee)}</span>
                      </div>
                      {appliedPromo && (
                        <div className="flex justify-between text-emerald-400">
                          <span>Discount ({appliedPromo})</span>
                          <span>-{formatIDR(discount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between border-t border-border pt-2 font-display text-lg font-black">
                        <span>Total</span>
                        <span className="text-brand-300">{formatIDR(total)}</span>
                      </div>
                    </div>
                    <Button
                      className="mt-5 w-full"
                      size="xl"
                      loading={submitting}
                      onClick={handleSubmit(onSubmit)}
                    >
                      PAY NOW
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
