import { format, parseISO } from "date-fns";

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function genId(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now()
    .toString(36)
    .slice(-4)}`;
}

let orderCounter = 16;

export function genOrderId(year = new Date().getFullYear()) {
  orderCounter += 1;
  return `TIX-${year}-${String(orderCounter).padStart(6, "0")}`;
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

export function formatIDR(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string) {
  try {
    return format(parseISO(dateStr), "EEEE, dd MMMM yyyy");
  } catch {
    return dateStr;
  }
}

export function formatDateShort(dateStr: string) {
  try {
    return format(parseISO(dateStr), "dd MMM yyyy");
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string) {
  try {
    return format(parseISO(dateStr), "dd MMM yyyy • HH:mm");
  } catch {
    return dateStr;
  }
}

export async function hashPassword(password: string) {
  const data = new TextEncoder().encode(`tix:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function genTicketQR(payload: {
  ticketId: string;
  orderId: string;
  eventId: string;
  userId: string;
}) {
  const raw = `${payload.ticketId}|${payload.orderId}|${payload.eventId}|${payload.userId}|TIX`;
  let hash = 0;
  for (let i = 0; i < raw.length; i += 1) {
    hash = (hash << 5) - hash + raw.charCodeAt(i);
    hash |= 0;
  }
  return `${raw}|${Math.abs(hash).toString(36).toUpperCase()}`;
}

export function genPaymentReference() {
  return `TIX-REF-${Date.now().toString(36).toUpperCase()}-${Math.floor(
    Math.random() * 9000 + 1000
  )}`;
}

export function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportCSV(rows: Record<string, unknown>[], filename: string) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const lines = rows.map((row) =>
    headers
      .map((h) => `"${String(row[h] ?? "").replace(/"/g, '""')}"`)
      .join(",")
  );
  const csv = [headers.join(","), ...lines].join("\r\n");
  downloadFile("\uFEFF" + csv, filename, "text/csv;charset=utf-8;");
}

export function generateICS(event: {
  title: string;
  date: string;
  time: string;
  venue: string;
  address: string;
}) {
  const [y, m, d] = event.date.split("-");
  const [hh, mm] = event.time.split(":");
  const start = new Date(+y, +m - 1, +d, +hh, +mm);
  const end = new Date(start.getTime() + 3 * 60 * 60 * 1000);
  const fmt = (dt: Date) =>
    dt
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//TIXCONCERT//EN",
    "BEGIN:VEVENT",
    `UID:${Date.now()}@tixconcert.com`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${event.title}`,
    `LOCATION:${event.venue}, ${event.address}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return ics;
}

export function initialName(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function timeLeft(deadline: number) {
  const diff = Math.max(0, deadline - Date.now());
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1000);
  return {
    h: String(h).padStart(2, "0"),
    m: String(m).padStart(2, "0"),
    s: String(s).padStart(2, "0"),
    total: diff,
  };
}

export function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "baru saja";
  if (mins < 60) return `${mins} menit lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  return `${days} hari lalu`;
}
