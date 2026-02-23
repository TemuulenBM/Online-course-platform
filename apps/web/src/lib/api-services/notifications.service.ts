import type { ApiResponse, PaginatedResponse } from '@ocp/shared-types';
import apiClient from '../api';

const client = apiClient.getClient();

/** Мэдэгдлийн бүтэц */
export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  data: Record<string, unknown> | null;
  createdAt: string;
}

export interface NotificationListParams {
  page?: number;
  limit?: number;
  type?: string;
  isRead?: boolean;
}

export const notificationsService = {
  list: async (params?: NotificationListParams): Promise<PaginatedResponse<Notification>> => {
    const res = await client.get<ApiResponse<PaginatedResponse<Notification>>>('/notifications', {
      params,
    });
    return res.data.data!;
  },

  getUnreadCount: async (): Promise<number> => {
    const res = await client.get<ApiResponse<{ count: number }>>('/notifications/unread-count');
    return res.data.data!.count;
  },

  markRead: async (id: string): Promise<void> => {
    await client.patch(`/notifications/${id}/read`);
  },

  markAllRead: async (): Promise<void> => {
    await client.patch('/notifications/mark-all-read');
  },
};
