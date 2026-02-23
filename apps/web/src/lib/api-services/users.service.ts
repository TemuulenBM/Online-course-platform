import type { ApiResponse, UserProfile } from '@ocp/shared-types';
import type { UpdateProfileInput } from '@ocp/validation';
import apiClient from '../api';

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
};
