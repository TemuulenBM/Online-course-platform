import type { ApiResponse, PaginatedResponse } from '@ocp/shared-types';
import apiClient from '../api';

const client = apiClient.getClient();

/** Мэдэгдлийн бүтэц — backend entity-тай тааруулсан */
export interface Notification {
  id: string;
  userId: string;
  type: 'EMAIL' | 'PUSH' | 'IN_APP' | 'SMS';
  title: string;
  message: string;
  read: boolean;
  data: Record<string, unknown> | null;
  sentAt: string;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationListParams {
  page?: number;
  limit?: number;
  type?: string;
  read?: boolean;
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

  delete: async (id: string): Promise<void> => {
    await client.delete(`/notifications/${id}`);
  },
};
