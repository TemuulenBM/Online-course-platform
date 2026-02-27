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

/** Мэдэгдлийн тохиргооны бүтэц */
export interface NotificationPreferences {
  id: string;
  userId: string;
  emailEnabled: boolean;
  pushEnabled: boolean;
  smsEnabled: boolean;
}

export interface UpdateNotificationPreferences {
  emailEnabled?: boolean;
  pushEnabled?: boolean;
  smsEnabled?: boolean;
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

  getPreferences: async (): Promise<NotificationPreferences> => {
    const res = await client.get<ApiResponse<NotificationPreferences>>(
      '/notifications/preferences',
    );
    return res.data.data!;
  },

  updatePreferences: async (
    data: UpdateNotificationPreferences,
  ): Promise<NotificationPreferences> => {
    const res = await client.patch<ApiResponse<NotificationPreferences>>(
      '/notifications/preferences',
      data,
    );
    return res.data.data!;
  },
};
