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

/** Сургалт үүсгэх өгөгдөл */
export interface CreateCourseData {
  title: string;
  description: string;
  categoryId: string;
  price?: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  language?: string;
  tags?: string[];
}

/** Сургалт шинэчлэх өгөгдөл */
export interface UpdateCourseData {
  title?: string;
  description?: string;
  categoryId?: string;
  price?: number;
  discountPrice?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  language?: string;
  tags?: string[];
  thumbnailUrl?: string;
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

  /** Шинэ сургалт үүсгэх */
  create: async (data: CreateCourseData): Promise<Course> => {
    const res = await client.post<ApiResponse<Course>>('/courses', data);
    return res.data.data!;
  },

  /** Сургалт шинэчлэх */
  update: async (id: string, data: UpdateCourseData): Promise<Course> => {
    const res = await client.patch<ApiResponse<Course>>(`/courses/${id}`, data);
    return res.data.data!;
  },

  /** Сургалт устгах (ADMIN only) */
  delete: async (id: string): Promise<void> => {
    await client.delete(`/courses/${id}`);
  },

  /** Сургалт нийтлэх (DRAFT → PUBLISHED) */
  publish: async (id: string): Promise<Course> => {
    const res = await client.patch<ApiResponse<Course>>(`/courses/${id}/publish`);
    return res.data.data!;
  },

  /** Сургалт архивлах (PUBLISHED → ARCHIVED) */
  archive: async (id: string): Promise<Course> => {
    const res = await client.patch<ApiResponse<Course>>(`/courses/${id}/archive`);
    return res.data.data!;
  },
};
