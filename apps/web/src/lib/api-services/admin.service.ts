import type { ApiResponse } from '@ocp/shared-types';
import apiClient from '../api';

const client = apiClient.getClient();

/** Admin хэрэглэгчдийн жагсаалтын параметрүүд */
export interface AdminUserListParams {
  page?: number;
  limit?: number;
  role?: 'STUDENT' | 'TEACHER' | 'ADMIN';
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

export const adminService = {
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
};
