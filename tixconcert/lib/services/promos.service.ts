import { getDBValue, mutate } from "@/lib/db";
import type { Promo } from "@/lib/types";
import { genId } from "@/lib/utils";

export function getAllPromos(): Promo[] {
  return getDBValue().promos;
}

export function createPromo(input: Omit<Promo, "id" | "usedCount">) {
  return mutate((db) => {
    const clash = db.promos.some(
      (p) => p.code.toLowerCase() === input.code.toLowerCase()
    );
    if (clash) return { ok: false, error: "Kode promo sudah digunakan." };
    const promo: Promo = { ...input, id: genId("promo"), usedCount: 0 };
    db.promos.push(promo);
    return { ok: true, promo };
  });
}

export function updatePromo(id: string, patch: Partial<Promo>) {
  return mutate((db) => {
    const promo = db.promos.find((p) => p.id === id);
    if (!promo) return { ok: false, error: "Promo tidak ditemukan." };
    Object.assign(promo, patch);
    return { ok: true, promo };
  });
}

export function deletePromo(id: string) {
  return mutate((db) => {
    db.promos = db.promos.filter((p) => p.id !== id);
  });
}
