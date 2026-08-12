"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Clock,
  Copy,
  Building2,
  CreditCard,
  Smartphone,
  QrCode,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useBookingStore } from "@/lib/store/booking-store";
import {
  confirmPayment,
  getOrderByPublicId,
} from "@/lib/services/order.service";
import { useCountdown } from "@/lib/hooks";
import { useDB } from "@/lib/db";
import { formatIDR } from "@/lib/utils";
import { toast } from "sonner";
import type { PaymentMethod } from "@/lib/types";

const instructions: Record<
  PaymentMethod,
  { icon: typeof Building2; title: string; steps: string[] }
> = {
  bank_transfer: {
    icon: Building2,
    title: "Bank Transfer",
    steps: [
      "Buka aplikasi mobile banking / ATM kamu.",
      "Transfer sejumlah total ke BCA 1234567890 a.n. PT TIXCONCERT.",
      "Kembali ke halaman ini dan tekan 'Check Payment Status'.",
    ],
  },
  virtual_account: {
    icon: CreditCard,
    title: "Virtual Account",
    steps: [
      "Gunakan nomor Virtual Account di bawah ini di ATM / m-banking.",
      "Ikuti instruksi pembayaran hingga selesai.",
      "Pembayaran akan terverifikasi otomatis.",
    ],
  },
  ewallet: {
    icon: Smartphone,
    title: "E-Wallet",
    steps: [
      "Buka aplikasi e-wallet (OVO / GoPay / Dana / ShopeePay).",
      "Bayar ke merchant TIXCONCERT sejumlah total.",
      "Kembali ke halaman ini dan verifikasi pembayaran.",
    ],
  },
  qris: {
    icon: QrCode,
    title: "QRIS",
    steps: [
      "Buka aplikasi pembayaran apa pun yang mendukung QRIS.",
      "Scan kode QRIS yang dikirim ke email kamu.",
      "Konfirmasi pembayaran hingga berhasil.",
    ],
  },
  credit_card: {
    icon: CreditCard,
    title: "Credit / Debit Card",
    steps: [
      "Pembayaran diproses secara otomatis oleh payment gateway.",
      "Masukkan detail kartu pada halaman aman.",
      "Tunggu sampai transaksi selesai diverifikasi.",
    ],
  },
};

const methodIcons: Record<PaymentMethod, typeof Building2> = {
  bank_transfer: Building2,
  virtual_account: CreditCard,
  ewallet: Smartphone,
  qris: QrCode,
  credit_card: CreditCard,
};

export default function PaymentPage() {
  useDB();
  const router = useRouter();
  const lastOrder = useBookingStore((s) => s.lastOrder);
  const [checking, setChecking] = useState(false);
  const [vaNumber] = useState(() =>
    `88${Math.floor(100000000 + Math.random() * 900000000)}`
  );
  const [copiedVa, setCopiedVa] = useState(false);

  const countdown = useCountdown(lastOrder?.deadline ?? null);

  useEffect(() => {
    if (countdown.expired) {
      toast.warning("Waktu pembayaran habis. Pesanan akan dibatalkan.");
    }
  }, [countdown.expired]);

  if (!lastOrder) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
        <h1 className="font-display text-2xl font-black">Tidak ada pembayaran aktif</h1>
        <p className="mt-2 text-sm text-muted">
          Mulai beli tiket untuk melihat halaman pembayaran.
        </p>
        <Button href="/concerts" className="mt-6">Explore Concerts</Button>
      </div>
    );
  }

  const methodInfo = instructions[lastOrder.method];
  const MethodIcon = methodInfo.icon;

  const checkPayment = async () => {
    setChecking(true);
    await new Promise((r) => setTimeout(r, 1200));
    const order = getOrderByPublicId(lastOrder.orderId);
    if (!order) {
      toast.error("Order tidak ditemukan");
      setChecking(false);
      return;
    }
    const result = confirmPayment(order.id, "");
    setChecking(false);
    if (result.ok) {
      toast.success("Pembayaran berhasil diverifikasi!");
      router.push(`/buy/success/${lastOrder.orderId}`);
    } else {
      toast.error(result.error ?? "Gagal memverifikasi");
    }
  };

  const copyVa = () => {
    navigator.clipboard.writeText(vaNumber).then(() => {
      setCopiedVa(true);
      toast.success("Nomor VA disalin");
      setTimeout(() => setCopiedVa(false), 2000);
    });
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/15 border border-amber-500/30">
          <Clock className="h-8 w-8 animate-pulse text-amber-400" />
        </div>
        <h1 className="mt-5 font-display text-3xl font-black tracking-tight">
          Waiting for Payment
        </h1>
        <p className="mt-2 text-sm text-muted">
          Selesaikan pembayaran sebelum waktu berakhir.
        </p>
      </div>

      <Card className="mt-8 p-6 text-center">
        <p className="text-xs uppercase tracking-widest text-muted">Order ID</p>
        <p className="mt-1 font-display text-xl font-black text-brand-300">
          {lastOrder.orderId}
        </p>
        <p className="mt-4 text-xs uppercase tracking-widest text-muted">Total</p>
        <p className="mt-1 font-display text-3xl font-black">
          {formatIDR(lastOrder.total)}
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          {["h", "m", "s"].map((unit) => {
            const isUrgent = countdown.remaining < 300000 && countdown.remaining > 0;
            const isCritical = countdown.remaining <= 0;
            return (
              <div
                key={unit}
                className={cn(
                  "w-20 rounded-2xl border py-3 transition-all",
                  isCritical
                    ? "border-red-500 bg-red-500/10 animate-pulse"
                    : isUrgent
                      ? "border-red-500/60 bg-red-500/5"
                      : "border-border bg-surface-2"
                )}
              >
                <p className={cn(
                  "font-display text-3xl font-black",
                  isCritical || isUrgent ? "text-red-500" : "text-foreground"
                )}>
                  {countdown[unit as "h" | "m" | "s"]}
                </p>
                <p className={cn(
                  "mt-0.5 text-[10px] uppercase tracking-widest",
                  isCritical || isUrgent ? "text-red-400" : "text-muted"
                )}>
                  {unit === "h" ? "Hours" : unit === "m" ? "Minutes" : "Seconds"}
                </p>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="mt-6 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-300">
            <MethodIcon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-lg font-black">{methodInfo.title}</h3>
            <p className="text-xs text-muted">
              {lastOrder.eventTitle} ·{" "}
              {lastOrder.method.replace("_", " ")}
            </p>
          </div>
        </div>

        {lastOrder.method === "virtual_account" && (
          <button
            onClick={copyVa}
            className="mt-4 flex w-full items-center justify-between rounded-xl border border-brand-500/30 bg-brand-500/5 p-4 transition-colors hover:bg-brand-500/10"
          >
            <div className="text-left">
              <p className="text-[10px] uppercase tracking-widest text-muted">
                Virtual Account Number
              </p>
              <p className="font-display text-xl font-black tracking-wider">
                {vaNumber}
              </p>
            </div>
            <Copy className="h-5 w-5 text-brand-300" />
          </button>
        )}

        <ol className="mt-5 space-y-2.5">
          {methodInfo.steps.map((s, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-muted">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-xs font-bold text-brand-300">
                {i + 1}
              </span>
              {s}
            </li>
          ))}
        </ol>

        {copiedVa && (
          <p className="mt-3 text-xs font-semibold text-emerald-400">
            Nomor VA berhasil disalin!
          </p>
        )}
      </Card>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Button
          className="w-full"
          size="xl"
          loading={checking}
          onClick={checkPayment}
        >
          <RefreshCw className="h-5 w-5" />
          Check Payment Status
        </Button>
        <Button
          variant="secondary"
          className="w-full"
          size="xl"
          onClick={() => router.push("/")}
        >
          Back to Home
        </Button>
      </div>

      <div className="mt-6 flex items-start gap-3 rounded-xl border border-border bg-card p-4">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-400" />
        <p className="text-xs text-muted">
          <span className="font-semibold text-foreground">Demo mode:</span>{" "}
          Tekan <span className="font-bold text-brand-300">Check Payment
          Status</span> untuk mensimulasikan pembayaran berhasil dan menghasilkan
          e-ticket.
        </p>
      </div>
    </div>
  );
}
