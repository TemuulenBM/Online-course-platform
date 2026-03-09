'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthTokens } from '@ocp/shared-types';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  setAuth: (user: User, tokens: AuthTokens) => void;
  setTokens: (tokens: AuthTokens) => void;
  setUser: (user: User) => void;
  clearAuth: () => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isHydrated: false,

      setAuth: (user, tokens) => set({ user, tokens, isAuthenticated: true }),

      setTokens: (tokens) => set({ tokens }),

      setUser: (user) => set({ user }),

      clearAuth: () => set({ user: null, tokens: null, isAuthenticated: false }),

      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: 'ocp-auth-storage',
      // accessToken-г localStorage-д хадгалахгүй — XSS халдлагаас хамгаалах
      // Зөвхөн refreshToken хадгалж, page reload үед шинэ accessToken авна
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens ? ({ refreshToken: state.tokens.refreshToken } as AuthTokens) : null,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);
