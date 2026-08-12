"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useParams, notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { ETicket } from "@/components/ticket/e-ticket";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useDB } from "@/lib/db";
import { getOrderByPublicId } from "@/lib/services/order.service";
import { useBookingStore } from "@/lib/store/booking-store";
import { formatIDR } from "@/lib/utils";

export default function PaymentSuccessPage() {
  const db = useDB();
  const params = useParams();
  const orderId = String(params.orderId);
  const reset = useBookingStore((s) => s.reset);

  const order = getOrderByPublicId(orderId);

  useEffect(() => {
    reset();
  }, [reset]);

  if (!order || order.status !== "paid") {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
        <h1 className="font-display text-2xl font-black">Order tidak ditemukan</h1>
        <p className="mt-2 text-sm text-muted">
          Order ini belum dibayar atau tidak tersedia.
        </p>
        <Button href="/concerts" className="mt-6">Explore Concerts</Button>
      </div>
    );
  }

  const tickets = db.tickets.filter((t) => t.orderId === order.id);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15 animate-scale-in">
          <CheckCircle2 className="h-10 w-10 text-emerald-400" />
        </div>
        <h1 className="mt-5 font-display text-3xl font-black tracking-tight sm:text-4xl">
          Payment Successful!
        </h1>
        <p className="mt-2 text-sm text-muted">
          Tiket kamu sudah aktif dan siap digunakan. Simpan e-ticket dengan baik ya.
        </p>
      </div>

      <Card className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 p-5 text-center">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted">Order ID</p>
          <p className="font-display text-sm font-black text-brand-300">{order.orderId}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted">Total Paid</p>
          <p className="font-display text-sm font-black">{formatIDR(order.total)}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted">Payment</p>
          <p className="text-sm font-bold capitalize">
            {order.paymentMethod.replace("_", " ")}
          </p>
        </div>
      </Card>

      <div className="mt-8 space-y-6">
        {tickets.map((t) => (
          <div key={t.id} className="flex justify-center">
            <ETicket ticket={t} buyerName={order.customerName} />
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Button href="/account/my-tickets" size="lg">
          View My Tickets
        </Button>
        <Button href="/concerts" variant="secondary" size="lg">
          Explore More Concerts
        </Button>
      </div>
    </div>
  );
}
