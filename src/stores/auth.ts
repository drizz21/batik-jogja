import { create } from "zustand";
import { persist } from "zustand/middleware";
import { adminLogin, adminLogout, getToken, setToken } from "@/lib/api";
import type { AdminUser } from "@/lib/api";

/**
 * Sesi admin - token Sanctum (persist localStorage) + profil.
 * Token juga dibaca langsung oleh klien API (Authorization Bearer).
 */
interface AuthState {
  admin: AdminUser | null;
  ready: boolean;
  /** Masuk via POST /api/v1/admin/login; lempar Error bila gagal. */
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  /** Tandai store selesai rehidrasi (dipakai guard rute admin). */
  setReady: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      admin: null,
      ready: false,

      login: async (email, password) => {
        const { admin, token } = await adminLogin(email, password);
        setToken(token);
        set({ admin });
      },

      logout: async () => {
        if (getToken()) await adminLogout();
        setToken(null);
        set({ admin: null });
      },

      setReady: () => set({ ready: true }),
    }),
    {
      name: "batik-jogja-admin",
      partialize: (s) => ({ admin: s.admin }),
      onRehydrateStorage: () => (s) => s?.setReady(),
    },
  ),
);

/** Token valid = ada admin + ada token tersimpan. */
export function useIsAuthed(): boolean {
  const admin = useAuth((s) => s.admin);
  return admin !== null && getToken() !== null;
}
