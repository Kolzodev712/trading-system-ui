import { create } from "zustand";
import {
  clearSession,
  loadToken,
  loadUser,
  saveSession,
  type AuthUser,
} from "@/lib/authStorage";

interface AuthStore {
  token: string | null;
  user: AuthUser | null;
  hydrated: boolean;
  setSession: (token: string, user: AuthUser) => void;
  clear: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  token: null,
  user: null,
  hydrated: false,
  setSession: (token, user) => {
    saveSession(token, user);
    set({ token, user });
  },
  clear: () => {
    clearSession();
    set({ token: null, user: null });
  },
  hydrate: () => {
    set({
      token: loadToken(),
      user: loadUser(),
      hydrated: true,
    });
  },
}));

export function useIsAuthenticated(): boolean {
  return useAuthStore((s) => !!s.token);
}
