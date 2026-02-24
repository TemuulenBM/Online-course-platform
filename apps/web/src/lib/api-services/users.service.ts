import type { ApiResponse, UserProfile } from '@ocp/shared-types';
import type { UpdateProfileInput } from '@ocp/validation';
import apiClient from '../api';

/** Хэрэглэгчийн статистик */
export interface UserStats {
  completedCourses: number;
  activeCourses: number;
  totalCertificates: number;
}

const client = apiClient.getClient();

export const usersService = {
  getMyProfile: async (): Promise<UserProfile> => {
    const res = await client.get<ApiResponse<UserProfile>>('/users/me/profile');
    return res.data.data!;
  },

  updateMyProfile: async (data: UpdateProfileInput): Promise<UserProfile> => {
    const res = await client.patch<ApiResponse<UserProfile>>('/users/me/profile', data);
    return res.data.data!;
  },

  /** Бусад хэрэглэгчийн профайл авах */
  getUserProfile: async (userId: string): Promise<UserProfile> => {
    const res = await client.get<ApiResponse<UserProfile>>(`/users/${userId}/profile`);
    return res.data.data!;
  },

  /** Аватар зураг upload хийх */
  uploadAvatar: async (file: File): Promise<UserProfile> => {
    const formData = new FormData();
    formData.append('avatar', file);
    const res = await client.post<ApiResponse<UserProfile>>('/users/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data!;
  },

  /** Хэрэглэгчийн статистик авах */
  getUserStats: async (userId: string): Promise<UserStats> => {
    const res = await client.get<ApiResponse<UserStats>>(`/users/${userId}/stats`);
    return res.data.data!;
  },
};
