import type { ApiResponse, Course, PaginatedResponse } from '@ocp/shared-types';
import apiClient from '../api';

const client = apiClient.getClient();

export interface CourseListParams {
  page?: number;
  limit?: number;
  categoryId?: string;
  difficulty?: string;
  language?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const coursesService = {
  list: async (params?: CourseListParams): Promise<PaginatedResponse<Course>> => {
    const res = await client.get<ApiResponse<PaginatedResponse<Course>>>('/courses', { params });
    return res.data.data!;
  },

  /** Миний сургалтууд (Багш/Админ — бүх status) */
  listMy: async (): Promise<Course[]> => {
    const res = await client.get<ApiResponse<PaginatedResponse<Course>>>('/courses/my', {
      params: { limit: 100 },
    });
    return res.data.data!.data;
  },

  getBySlug: async (slug: string): Promise<Course> => {
    const res = await client.get<ApiResponse<Course>>(`/courses/slug/${slug}`);
    return res.data.data!;
  },

  getById: async (id: string): Promise<Course> => {
    const res = await client.get<ApiResponse<Course>>(`/courses/${id}`);
    return res.data.data!;
  },
};
