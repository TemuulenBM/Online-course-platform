import type { ApiResponse, Lesson, LessonType } from '@ocp/shared-types';
import apiClient from '../api';

const client = apiClient.getClient();

/** Хичээл үүсгэх өгөгдөл */
export interface CreateLessonData {
  title: string;
  courseId: string;
  lessonType: LessonType;
  durationMinutes?: number;
  isPreview?: boolean;
  isPublished?: boolean;
}

/** Хичээл шинэчлэх өгөгдөл */
export interface UpdateLessonData {
  title?: string;
  lessonType?: LessonType;
  durationMinutes?: number;
  isPreview?: boolean;
  isPublished?: boolean;
}

/** Хичээлүүдийн дараалал солих өгөгдөл */
export interface ReorderLessonsData {
  courseId: string;
  items: { lessonId: string; orderIndex: number }[];
}

export const lessonsService = {
  /** Сургалтын хичээлүүдийн жагсаалт */
  listByCourse: async (courseId: string): Promise<Lesson[]> => {
    const res = await client.get<ApiResponse<Lesson[]>>(`/lessons/course/${courseId}`);
    return res.data.data!;
  },

  /** Нэг хичээлийн дэлгэрэнгүй */
  getById: async (lessonId: string): Promise<Lesson> => {
    const res = await client.get<ApiResponse<Lesson>>(`/lessons/${lessonId}`);
    return res.data.data!;
  },

  /** Шинэ хичээл үүсгэх */
  create: async (data: CreateLessonData): Promise<Lesson> => {
    const res = await client.post<ApiResponse<Lesson>>('/lessons', data);
    return res.data.data!;
  },

  /** Хичээл шинэчлэх */
  update: async (id: string, data: UpdateLessonData): Promise<Lesson> => {
    const res = await client.patch<ApiResponse<Lesson>>(`/lessons/${id}`, data);
    return res.data.data!;
  },

  /** Хичээл устгах */
  delete: async (id: string): Promise<void> => {
    await client.delete(`/lessons/${id}`);
  },

  /** Хичээлийн нийтлэлтийг toggle хийх */
  togglePublish: async (id: string): Promise<Lesson> => {
    const res = await client.patch<ApiResponse<Lesson>>(`/lessons/${id}/publish`);
    return res.data.data!;
  },

  /** Хичээлүүдийн дарааллыг өөрчлөх */
  reorder: async (data: ReorderLessonsData): Promise<void> => {
    await client.patch('/lessons/reorder', data);
  },
};
