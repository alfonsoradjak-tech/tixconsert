import type { LucideIcon } from "lucide-react";

export type Role = "user" | "admin" | "staff";

export type TicketStatus =
  | "paid"
  | "pending"
  | "cancelled"
  | "used"
  | "refunded";

export type OrderStatus =
  | "pending"
  | "paid"
  | "cancelled"
  | "refunded"
  | "expired";

export type PaymentStatus = "pending" | "paid" | "cancelled" | "refunded";

export type PaymentMethod =
  | "bank_transfer"
  | "virtual_account"
  | "ewallet"
  | "qris"
  | "credit_card";

export type SeatStatus = "available" | "selected" | "sold" | "reserved";

export type EventStatus = "published" | "draft";

export type EventBadge = "hot" | "best_seller" | "limited" | "sold_out";

export type TicketAvailability = "available" | "low" | "sold_out";

export interface Artist {
  id: string;
  name: string;
  genre: string;
  image: string;
  bio: string;
}

export interface Venue {
  id: string;
  name: string;
  city: string;
  address: string;
  capacity: number;
  description: string;
}

export interface TicketCategory {
  id: string;
  name: string;
  price: number;
  benefits: string[];
  quantity: number;
  sold: number;
  isSeated: boolean;
  sectionId?: string;
}

export interface SeatMapSection {
  id: string;
  name: string;
  color: string;
  rows: string[];
  cols: number;
}

export interface SeatMap {
  id: string;
  sections: SeatMapSection[];
}

export interface ConcertEvent {
  id: string;
  slug: string;
  title: string;
  artistId: string;
  category: string;
  description: string;
  longDescription: string;
  poster: string;
  date: string;
  time: string;
  venueId: string;
  status: EventStatus;
  featured: boolean;
  badges: EventBadge[];
  ticketCategories: TicketCategory[];
  hasSeatLayout: boolean;
  seatMap?: SeatMap;
  tags: string[];
  views: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: Role;
  isSuspended: boolean;
  createdAt: string;
}

export interface Promo {
  id: string;
  code: string;
  discountPercent: number;
  maxDiscount: number;
  minPurchase: number;
  expiresAt: string;
  usageLimit: number;
  usedCount: number;
  active: boolean;
}

export interface OrderItem {
  id: string;
  ticketCategoryId: string;
  ticketType: string;
  quantity: number;
  unitPrice: number;
  seats: string[];
}

export interface Order {
  id: string;
  orderId: string;
  userId: string;
  eventId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  serviceFee: number;
  discount: number;
  paymentFee: number;
  total: number;
  promoCode?: string;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  createdAt: string;
  paidAt?: string;
}

export interface Ticket {
  id: string;
  orderId: string;
  orderItemId: string;
  eventId: string;
  userId: string;
  ticketType: string;
  price: number;
  seat?: string;
  qr: string;
  status: TicketStatus;
  checkInAt?: string;
  checkInBy?: string;
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  reference: string;
  createdAt: string;
  paidAt?: string;
}

export interface Checkin {
  id: string;
  ticketId: string;
  eventId: string;
  checkedInAt: string;
  checkInBy: string;
}

export interface Favorite {
  userId: string;
  eventId: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "success" | "info" | "warning" | "danger";
  read: boolean;
  createdAt: string;
}

export interface SeatOption {
  id: string;
  eventId: string;
  sectionId: string;
  row: string;
  number: number;
  price: number;
  status: SeatStatus;
  label: string;
}

export interface GenreInfo {
  slug: string;
  name: string;
  icon: LucideIcon;
  color: string;
  description: string;
}
