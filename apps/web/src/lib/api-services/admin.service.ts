import type { ApiResponse } from '@ocp/shared-types';
import apiClient from '../api';

const client = apiClient.getClient();

/* ================================================================
 *  Хэрэглэгчийн удирдлагын types
 * ================================================================ */

/** Admin хэрэглэгчдийн жагсаалтын параметрүүд */
export interface AdminUserListParams {
  page?: number;
  limit?: number;
  role?: 'STUDENT' | 'TEACHER' | 'ADMIN';
  emailVerified?: boolean;
}

/** Admin хэрэглэгчийн profile */
export interface AdminUserProfile {
  id: string;
  userId: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
}

/** Admin хэрэглэгчийн мэдээлэл */
export interface AdminUser {
  id: string;
  email: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  emailVerified: boolean;
  createdAt: string;
  profile: AdminUserProfile | null;
}

/** Жагсаалтын meta мэдээлэл */
export interface AdminUserListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Жагсаалтын хариулт */
export interface AdminUserListResponse {
  data: AdminUser[];
  meta: AdminUserListMeta;
}

/** Эрх солих хариулт */
export interface UpdateRoleResponse {
  id: string;
  email: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
}

/* ================================================================
 *  Системийн health types
 * ================================================================ */

/** Нэг service-ийн health status */
export interface ServiceHealth {
  status: 'ok' | 'error';
  latencyMs?: number;
}

/** Системийн health хариулт */
export interface SystemHealthResponse {
  status: 'ok' | 'degraded';
  timestamp: string;
  services: {
    database: ServiceHealth;
    redis: ServiceHealth;
    mongodb: { status: 'ok' | 'error' };
  };
}

/* ================================================================
 *  Модерацийн types
 * ================================================================ */

/** Модерацийн статистик */
export interface ModerationStats {
  flaggedCount: number;
  lockedCount: number;
}

/** Тэмдэглэгдсэн контент */
export interface FlaggedContent {
  id: string;
  courseId: string;
  authorId: string;
  postType: string;
  title: string | null;
  contentPreview: string;
  flagReason: string | null;
  isFlagged: boolean;
  isLocked: boolean;
  viewsCount: number;
  createdAt: string;
}

/** Тэмдэглэгдсэн контент жагсаалтын параметрүүд */
export interface FlaggedContentParams {
  page?: number;
  limit?: number;
  courseId?: string;
}

/** Тэмдэглэгдсэн контент жагсаалтын хариулт */
export interface FlaggedContentListResponse {
  data: FlaggedContent[];
  total: number;
  page: number;
  limit: number;
}

/* ================================================================
 *  Audit log types
 * ================================================================ */

/** Audit log entry */
export interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string | null;
  userEmail: string | null;
  action: string;
  entityType: string;
  entityId: string;
  changes: Record<string, unknown> | null;
  ipAddress: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

/** Audit log жагсаалтын параметрүүд */
export interface AuditLogListParams {
  page?: number;
  limit?: number;
  userId?: string;
  entityType?: string;
  action?: string;
  dateFrom?: string;
  dateTo?: string;
}

/** Audit log жагсаалтын хариулт */
export interface AuditLogListResponse {
  data: AuditLogEntry[];
  total: number;
  page: number;
  limit: number;
}

/* ================================================================
 *  Системийн тохиргооны types
 * ================================================================ */

/** Системийн тохиргоо */
export interface SystemSetting {
  id: string;
  key: string;
  value: unknown;
  description: string | null;
  category: string;
  isPublic: boolean;
  updatedAt: string;
}

/** Тохиргоо upsert DTO */
export interface UpsertSettingDto {
  value: unknown;
  description?: string;
  category?: string;
  isPublic?: boolean;
}

/* ================================================================
 *  Admin Service
 * ================================================================ */

export const adminService = {
  /* ======== Хэрэглэгчийн удирдлага ======== */

  /** Хэрэглэгчдийн жагсаалт (ADMIN only) */
  listUsers: async (params?: AdminUserListParams): Promise<AdminUserListResponse> => {
    const res = await client.get<ApiResponse<AdminUserListResponse>>('/users', { params });
    return res.data.data!;
  },

  /** Хэрэглэгчийн эрх солих (ADMIN only) */
  updateUserRole: async (userId: string, role: string): Promise<UpdateRoleResponse> => {
    const res = await client.patch<ApiResponse<UpdateRoleResponse>>(`/users/${userId}/role`, {
      role,
    });
    return res.data.data!;
  },

  /** Хэрэглэгч устгах (ADMIN only) */
  deleteUser: async (userId: string): Promise<void> => {
    await client.delete(`/users/${userId}`);
  },

  /* ======== Системийн health ======== */

  /** Системийн health шалгах */
  getSystemHealth: async (): Promise<SystemHealthResponse> => {
    const res = await client.get<ApiResponse<SystemHealthResponse>>('/admin/dashboard/health');
    return res.data.data!;
  },

  /* ======== Модерац ======== */

  /** Модерацийн статистик */
  getModerationStats: async (): Promise<ModerationStats> => {
    const res = await client.get<ApiResponse<ModerationStats>>('/admin/dashboard/moderation');
    return res.data.data!;
  },

  /** Тэмдэглэгдсэн контент жагсаалт */
  getFlaggedContent: async (params?: FlaggedContentParams): Promise<FlaggedContentListResponse> => {
    const res = await client.get<ApiResponse<FlaggedContentListResponse>>(
      '/admin/dashboard/moderation/flagged',
      { params },
    );
    return res.data.data!;
  },

  /** Тэмдэглэгдсэн контент approve хийх */
  approveFlaggedContent: async (id: string): Promise<{ message: string }> => {
    const res = await client.patch<ApiResponse<{ message: string }>>(
      `/admin/dashboard/moderation/flagged/${id}/approve`,
    );
    return res.data.data!;
  },

  /** Тэмдэглэгдсэн контент reject хийх */
  rejectFlaggedContent: async (id: string, reason?: string): Promise<{ message: string }> => {
    const res = await client.patch<ApiResponse<{ message: string }>>(
      `/admin/dashboard/moderation/flagged/${id}/reject`,
      { action: 'reject', reason },
    );
    return res.data.data!;
  },

  /* ======== Audit log ======== */

  /** Audit log жагсаалт */
  listAuditLogs: async (params?: AuditLogListParams): Promise<AuditLogListResponse> => {
    const res = await client.get<ApiResponse<AuditLogListResponse>>('/admin/audit-logs', {
      params,
    });
    return res.data.data!;
  },

  /** Entity-ийн audit log жагсаалт */
  getEntityAuditLogs: async (
    entityType: string,
    entityId: string,
  ): Promise<AuditLogListResponse> => {
    const res = await client.get<ApiResponse<AuditLogListResponse>>(
      `/admin/audit-logs/entity/${entityType}/${entityId}`,
    );
    return res.data.data!;
  },

  /** Нэг audit log дэлгэрэнгүй */
  getAuditLogDetail: async (id: string): Promise<AuditLogEntry> => {
    const res = await client.get<ApiResponse<AuditLogEntry>>(`/admin/audit-logs/${id}`);
    return res.data.data!;
  },

  /* ======== Системийн тохиргоо ======== */

  /** Бүх тохиргоо жагсаалт */
  listSettings: async (category?: string): Promise<SystemSetting[]> => {
    const res = await client.get<ApiResponse<SystemSetting[]>>('/admin/settings', {
      params: category ? { category } : undefined,
    });
    return res.data.data!;
  },

  /** Key-аар нэг тохиргоо авах */
  getSettingByKey: async (key: string): Promise<SystemSetting> => {
    const res = await client.get<ApiResponse<SystemSetting>>(`/admin/settings/${key}`);
    return res.data.data!;
  },

  /** Тохиргоо upsert хийх */
  upsertSetting: async (key: string, data: UpsertSettingDto): Promise<SystemSetting> => {
    const res = await client.put<ApiResponse<SystemSetting>>(`/admin/settings/${key}`, data);
    return res.data.data!;
  },

  /** Тохиргоо устгах */
  deleteSetting: async (key: string): Promise<{ message: string }> => {
    const res = await client.delete<ApiResponse<{ message: string }>>(`/admin/settings/${key}`);
    return res.data.data!;
  },
};
