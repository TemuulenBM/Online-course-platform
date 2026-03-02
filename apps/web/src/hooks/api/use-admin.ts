'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/lib/api-services/admin.service';
import type {
  AdminUserListParams,
  AuditLogListParams,
  FlaggedContentParams,
} from '@/lib/api-services/admin.service';
import { QUERY_KEYS } from '@/lib/constants';

/* ================================================================
 *  Хэрэглэгчийн удирдлага
 * ================================================================ */

/** Хэрэглэгчдийн жагсаалт (ADMIN only) */
export function useAdminUsers(params?: AdminUserListParams) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.users(params),
    queryFn: () => adminService.listUsers(params),
  });
}

/** Хэрэглэгчийн эрх солих (ADMIN only) */
export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      adminService.updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin', 'users'],
      });
    },
  });
}

/** Хэрэглэгч устгах (ADMIN only) */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => adminService.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin', 'users'],
      });
    },
  });
}

/* ================================================================
 *  Системийн health — 30 сек auto-refresh
 * ================================================================ */

/** Системийн health мэдээлэл (auto-refresh 30s) */
export function useSystemHealth() {
  return useQuery({
    queryKey: QUERY_KEYS.admin.health,
    queryFn: () => adminService.getSystemHealth(),
    refetchInterval: 30_000,
  });
}

/* ================================================================
 *  Модерац
 * ================================================================ */

/** Модерацийн статистик */
export function useModerationStats() {
  return useQuery({
    queryKey: QUERY_KEYS.admin.moderationStats,
    queryFn: () => adminService.getModerationStats(),
  });
}

/** Тэмдэглэгдсэн контент жагсаалт */
export function useFlaggedContent(params?: FlaggedContentParams) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.flaggedContent(params),
    queryFn: () => adminService.getFlaggedContent(params),
  });
}

/** Тэмдэглэгдсэн контент approve хийх */
export function useApproveFlaggedContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminService.approveFlaggedContent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'flagged-content'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.moderationStats });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.analytics.pendingItems });
    },
  });
}

/** Тэмдэглэгдсэн контент reject хийх */
export function useRejectFlaggedContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      adminService.rejectFlaggedContent(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'flagged-content'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.moderationStats });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.analytics.pendingItems });
    },
  });
}

/* ================================================================
 *  Audit log
 * ================================================================ */

/** Audit log жагсаалт */
export function useAuditLogs(params?: AuditLogListParams) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.auditLogs(params),
    queryFn: () => adminService.listAuditLogs(params),
  });
}

/** Entity-ийн audit log жагсаалт */
export function useEntityAuditLogs(entityType: string, entityId: string) {
  return useQuery({
    queryKey: ['admin', 'audit-logs', entityType, entityId] as const,
    queryFn: () => adminService.getEntityAuditLogs(entityType, entityId),
    enabled: !!entityType && !!entityId,
  });
}

/** Нэг audit log дэлгэрэнгүй */
export function useAuditLogDetail(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.auditLogDetail(id),
    queryFn: () => adminService.getAuditLogDetail(id),
    enabled: !!id,
  });
}

/* ================================================================
 *  Системийн тохиргоо
 * ================================================================ */

/** Тохиргоо жагсаалт */
export function useSettings(category?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.settings(category),
    queryFn: () => adminService.listSettings(category),
  });
}

/** Тохиргоо upsert хийх */
export function useUpsertSetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      key,
      data,
    }: {
      key: string;
      data: { value: unknown; description?: string; category?: string; isPublic?: boolean };
    }) => adminService.upsertSetting(key, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] });
    },
  });
}

/** Тохиргоо устгах */
export function useDeleteSetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (key: string) => adminService.deleteSetting(key),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] });
    },
  });
}
