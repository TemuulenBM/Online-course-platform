'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationsService } from '@/lib/api-services/notifications.service';
import type { NotificationListParams } from '@/lib/api-services/notifications.service';
import { QUERY_KEYS } from '@/lib/constants';
import { useAuthStore } from '@/stores/auth-store';

/** Мэдэгдлүүдийн жагсаалт (pagination + filters) */
export function useNotifications(params?: NotificationListParams) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: QUERY_KEYS.notifications.list(params),
    queryFn: () => notificationsService.list(params),
    enabled: isAuthenticated,
  });
}

/** Уншаагүй мэдэгдлийн тоо — 30 секунд тутам шинэчлэгдэнэ */
export function useUnreadNotificationCount() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: QUERY_KEYS.notifications.unreadCount,
    queryFn: () => notificationsService.getUnreadCount(),
    enabled: isAuthenticated,
    refetchInterval: 30 * 1000,
  });
}

/** Бүх мэдэгдлийг уншсан болгох mutation */
export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsService.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.notifications.unreadCount,
      });
      queryClient.invalidateQueries({
        queryKey: ['notifications', 'list'],
      });
    },
  });
}

/** Нэг мэдэгдлийг уншсан болгох mutation */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationsService.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.notifications.unreadCount,
      });
      queryClient.invalidateQueries({
        queryKey: ['notifications', 'list'],
      });
    },
  });
}
