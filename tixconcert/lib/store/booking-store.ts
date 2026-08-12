"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PaymentMethod } from "@/lib/types";

export interface BookingItem {
  eventId: string;
  ticketCategoryId: string;
  qty: number;
  seats: string[];
}

export interface BookingCustomer {
  name: string;
  email: string;
  phone: string;
}

export interface CompletedOrderInfo {
  orderId: string;
  total: number;
  deadline: number;
  method: PaymentMethod;
  eventTitle: string;
  eventSlug: string;
}

interface BookingState {
  eventId: string | null;
  items: BookingItem[];
  customer: BookingCustomer;
  method: PaymentMethod;
  promoCode: string;
  lastOrder: CompletedOrderInfo | null;
  startBooking: (eventId: string) => void;
  setCategory: (ticketCategoryId: string) => void;
  addCategory: (ticketCategoryId: string, qty?: number) => void;
  setQty: (ticketCategoryId: string, qty: number) => void;
  removeCategory: (ticketCategoryId: string) => void;
  setSeats: (ticketCategoryId: string, seats: string[]) => void;
  toggleSeat: (seat: string) => void;
  clearSeats: () => void;
  setCustomer: (patch: Partial<BookingCustomer>) => void;
  setMethod: (method: PaymentMethod) => void;
  setPromo: (code: string) => void;
  complete: (info: CompletedOrderInfo) => void;
  reset: () => void;
}

export const useBookingStore = create<BookingState>()(
  persist(
    (set) => ({
      eventId: null,
      items: [],
      customer: { name: "", email: "", phone: "" },
      method: "qris",
      promoCode: "",
      lastOrder: null,
      startBooking: (eventId) =>
        set({ eventId, items: [], promoCode: "", lastOrder: null }),
      setCategory: (ticketCategoryId) =>
        set((s) => ({
          items: [{ eventId: s.eventId ?? "", ticketCategoryId, qty: 1, seats: [] }],
        })),
      addCategory: (ticketCategoryId, qty = 1) =>
        set((s) => {
          const existing = s.items.find(
            (i) => i.ticketCategoryId === ticketCategoryId
          );
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.ticketCategoryId === ticketCategoryId
                  ? { ...i, qty: i.qty + qty }
                  : i
              ),
            };
          }
          return {
            items: [
              ...s.items,
              { eventId: s.eventId ?? "", ticketCategoryId, qty, seats: [] },
            ],
          };
        }),
      setQty: (ticketCategoryId, qty) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.ticketCategoryId === ticketCategoryId
              ? { ...i, qty: Math.max(1, qty), seats: [] }
              : i
          ),
        })),
      removeCategory: (ticketCategoryId) =>
        set((s) => ({
          items: s.items.filter((i) => i.ticketCategoryId !== ticketCategoryId),
        })),
      setSeats: (ticketCategoryId, seats) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.ticketCategoryId === ticketCategoryId ? { ...i, seats } : i
          ),
        })),
      toggleSeat: (seat) =>
        set((s) => {
          const target = s.items.find((i) => i.seats.length > 0);
          if (!target) return s;
          return {
            items: s.items.map((i) => {
              if (i.ticketCategoryId !== target.ticketCategoryId) return i;
              const has = i.seats.includes(seat);
              return {
                ...i,
                seats: has
                  ? i.seats.filter((x) => x !== seat)
                  : [...i.seats, seat],
              };
            }),
          };
        }),
      clearSeats: () =>
        set((s) => ({
          items: s.items.map((i) => ({ ...i, seats: [] })),
        })),
      setCustomer: (patch) =>
        set((s) => ({ customer: { ...s.customer, ...patch } })),
      setMethod: (method) => set({ method }),
      setPromo: (promoCode) => set({ promoCode }),
      complete: (info) => set({ lastOrder: info }),
      reset: () =>
        set({
          eventId: null,
          items: [],
          customer: { name: "", email: "", phone: "" },
          method: "qris",
          promoCode: "",
          lastOrder: null,
        }),
    }),
    { name: "tix_booking_v1" }
  )
);
