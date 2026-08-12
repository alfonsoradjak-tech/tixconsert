import { getDBValue, mutate } from "@/lib/db";
import type { User } from "@/lib/types";
import { genId, hashPassword } from "@/lib/utils";

const SESSION_KEY = "tix_session_v1";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: User["role"];
}

export function getSession(): SessionUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch {
    return null;
  }
}

export function setSession(user: SessionUser) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function getCurrentUser(): User | null {
  const session = getSession();
  if (!session) return null;
  return getDBValue().users.find((u) => u.id === session.id) ?? null;
}

export async function registerUser(input: {
  name: string;
  email: string;
  phone: string;
  password: string;
}): Promise<{ ok: boolean; error?: string; user?: User }> {
  const email = input.email.trim().toLowerCase();
  const passwordHash = await hashPassword(input.password);
  return mutate((db) => {
    const exists = db.users.some((u) => u.email.toLowerCase() === email);
    if (exists) return { ok: false, error: "Email sudah terdaftar. Gunakan email lain." };
    const user: User = {
      id: genId("usr"),
      name: input.name.trim(),
      email,
      phone: input.phone.trim(),
      passwordHash,
      role: "user",
      isSuspended: false,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    db.users.push(user);
    db.notifications.push({
      id: genId("ntf"),
      userId: user.id,
      title: "Selamat datang di TIXCONCERT!",
      message: `Halo ${user.name}, akun kamu berhasil dibuat. Saatnya menemukan konser favoritmu.`,
      type: "success",
      read: false,
      createdAt: new Date().toISOString(),
    });
    return { ok: true, user };
  });
}

export async function verifyCredentials(email: string, password: string) {
  const db = getDBValue();
  const found = db.users.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase()
  );
  if (!found) return { ok: false, error: "Email atau password salah." };
  if (found.isSuspended)
    return { ok: false, error: "Akun kamu sedang ditangguhkan. Hubungi admin." };
  const hash = await hashPassword(password);
  if (hash !== found.passwordHash)
    return { ok: false, error: "Email atau password salah." };
  return { ok: true, user: found };
}

export async function changePassword(userId: string, newPassword: string) {
  const passwordHash = await hashPassword(newPassword);
  return mutate((db) => {
    const user = db.users.find((u) => u.id === userId);
    if (user) user.passwordHash = passwordHash;
  });
}

export function updateProfile(
  userId: string,
  patch: { name?: string; phone?: string; email?: string }
) {
  return mutate((db) => {
    const user = db.users.find((u) => u.id === userId);
    if (!user) return { ok: false, error: "User tidak ditemukan" };
    if (patch.email) {
      const clash = db.users.some(
        (u) =>
          u.email.toLowerCase() === patch.email!.toLowerCase() &&
          u.id !== userId
      );
      if (clash) return { ok: false, error: "Email sudah digunakan user lain." };
      user.email = patch.email.trim();
    }
    if (patch.name) user.name = patch.name.trim();
    if (patch.phone) user.phone = patch.phone.trim();
    const session = getSession();
    if (session) {
      setSession({ ...session, name: user.name, email: user.email });
    }
    return { ok: true };
  });
}

export function toggleSuspendUser(userId: string) {
  return mutate((db) => {
    const user = db.users.find((u) => u.id === userId);
    if (!user) return { ok: false };
    if (user.role === "admin") return { ok: false, error: "Tidak bisa suspend admin." };
    user.isSuspended = !user.isSuspended;
    return { ok: true, suspended: user.isSuspended };
  });
}

export function deleteUserAccount(userId: string) {
  return mutate((db) => {
    const user = db.users.find((u) => u.id === userId);
    if (!user) return { ok: false };
    if (user.role === "admin") return { ok: false, error: "Tidak bisa menghapus admin." };
    db.users = db.users.filter((u) => u.id !== userId);
    db.notifications = db.notifications.filter((n) => n.userId !== userId);
    db.favorites = db.favorites.filter((f) => f.userId !== userId);
    return { ok: true };
  });
}
