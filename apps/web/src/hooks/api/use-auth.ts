'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { authService } from '@/lib/api-services/auth.service';
import { ROUTES } from '@/lib/constants';

/** Нэвтрэх mutation — rememberMe=true бол 30 хоног, false бол 7 хоногийн cookie */
export function useLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      data,
    }: {
      data: Parameters<typeof authService.login>[0];
      rememberMe?: boolean;
    }) => authService.login(data),
    onSuccess: (data, variables) => {
      setAuth(data.user, {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });

      /** rememberMe=true → 30 хоног, false → 7 хоног */
      const maxAge = variables.rememberMe ? 2592000 : 604800;
      document.cookie = `ocp-auth=1; path=/; max-age=${maxAge}; SameSite=Lax`;
      queryClient.clear();

      const callbackUrl = searchParams.get('callbackUrl');
      router.push(callbackUrl || ROUTES.DASHBOARD);
    },
  });
}

/** Бүртгүүлэх mutation */
export function useRegister() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      setAuth(data.user, {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
      document.cookie = 'ocp-auth=1; path=/; max-age=604800; SameSite=Lax';
      queryClient.clear();
      router.push(ROUTES.DASHBOARD);
    },
  });
}

/** Гарах mutation */
export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.logout,
    onSettled: () => {
      clearAuth();
      document.cookie = 'ocp-auth=; max-age=0; path=/';
      queryClient.clear();
      router.push(ROUTES.LOGIN);
    },
  });
}

/** Нууц үг сэргээх mutation */
export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => authService.forgotPassword(email),
  });
}

/** Нууц үг шинэчлэх mutation */
export function useResetPassword() {
  return useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      authService.resetPassword(token, password),
  });
}
