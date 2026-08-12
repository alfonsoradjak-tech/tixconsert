"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  clearSession,
  getSession,
  registerUser,
  setSession,
  type SessionUser,
  verifyCredentials,
} from "@/lib/services/auth.service";

interface AuthState {
  session: SessionUser | null;
  hydrate: () => void;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (input: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      hydrate: () => {
        const s = getSession();
        if (s) set({ session: s });
      },
      login: async (email, password) => {
        const result = await verifyCredentials(email, password);
        if (!result.ok || !result.user) {
          return { ok: false, error: result.error ?? "Login gagal." };
        }
        const session: SessionUser = {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
        };
        setSession(session);
        set({ session });
        return { ok: true };
      },
      register: async (input) => {
        const result = await registerUser(input);
        if (!result.ok || !result.user) {
          return { ok: false, error: result.error ?? "Pendaftaran gagal." };
        }
        const session: SessionUser = {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
        };
        setSession(session);
        set({ session });
        return { ok: true };
      },
      logout: () => {
        clearSession();
        set({ session: null });
      },
    }),
    { name: "tix_session_v2" }
  )
);
