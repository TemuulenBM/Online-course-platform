'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { authService } from '@/lib/api-services/auth.service';

/**
 * Auth Provider — App mount болоход token-ийг validate хийнэ.
 * Persist хийгдсэн token байвал GET /auth/me дуудаж шалгана.
 * Cookie тавих/устгах замаар middleware-д auth төлөв дамжуулна.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { tokens, isHydrated, setAuth, clearAuth } = useAuthStore();
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    if (!isHydrated) return;

    const validateAuth = async () => {
      if (!tokens?.accessToken) {
        removeCookie();
        setIsValidating(false);
        return;
      }

      try {
        const user = await authService.getMe();
        setAuth(user, tokens);
        setCookie();
      } catch {
        clearAuth();
        removeCookie();
      } finally {
        setIsValidating(false);
      }
    };

    validateAuth();
  }, [isHydrated]);

  // Hydration эсвэл validation дуусаагүй бол loading
  if (!isHydrated || isValidating) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#2E3035]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-primary" />
          <span className="text-sm font-medium text-white/60">Ачааллаж байна...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

/** Auth cookie тавих — middleware-д ашиглагдана */
function setCookie() {
  if (typeof document !== 'undefined') {
    document.cookie = 'ocp-auth=1; path=/; max-age=604800; SameSite=Lax';
  }
}

/** Auth cookie устгах */
function removeCookie() {
  if (typeof document !== 'undefined') {
    document.cookie = 'ocp-auth=; max-age=0; path=/';
  }
}
