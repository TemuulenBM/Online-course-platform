import type { ApiResponse } from '@ocp/shared-types';
import apiClient from '../api';

const client = apiClient.getClient();

/** Хичээлийн контент */
export interface LessonContent {
  id: string;
  lessonId: string;
  contentType: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  textContent?: string;
  metadata?: Record<string, unknown>;
}

/** Текст контент тавих өгөгдөл */
export interface SetTextContentData {
  lessonId: string;
  html: string;
  markdown?: string;
  readingTimeMinutes?: number;
}

/** Видео контент тавих өгөгдөл */
export interface SetVideoContentData {
  lessonId: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  durationSeconds?: number;
}

/** Контент шинэчлэх өгөгдөл */
export interface UpdateContentData {
  html?: string;
  markdown?: string;
  readingTimeMinutes?: number;
  videoUrl?: string;
  thumbnailUrl?: string;
  durationSeconds?: number;
}

export type FileType = 'video' | 'thumbnail' | 'attachment' | 'subtitle';

export const contentService = {
  /** Хичээлийн контент авах */
  getByLessonId: async (lessonId: string): Promise<LessonContent> => {
    const res = await client.get<ApiResponse<LessonContent>>(`/content/lesson/${lessonId}`);
    return res.data.data!;
  },

  /** Текст контент тавих (upsert) */
  setTextContent: async (data: SetTextContentData): Promise<LessonContent> => {
    const res = await client.post<ApiResponse<LessonContent>>('/content/text', data);
    return res.data.data!;
  },

  /** Видео контент тавих (upsert) */
  setVideoContent: async (data: SetVideoContentData): Promise<LessonContent> => {
    const res = await client.post<ApiResponse<LessonContent>>('/content/video', data);
    return res.data.data!;
  },

  /** Контент шинэчлэх */
  updateContent: async (lessonId: string, data: UpdateContentData): Promise<LessonContent> => {
    const res = await client.patch<ApiResponse<LessonContent>>(`/content/lesson/${lessonId}`, data);
    return res.data.data!;
  },

  /** Контент устгах */
  deleteContent: async (lessonId: string): Promise<void> => {
    await client.delete(`/content/lesson/${lessonId}`);
  },

  /** Файл upload хийх */
  uploadFile: async (lessonId: string, file: File, fileType: FileType): Promise<LessonContent> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await client.post<ApiResponse<LessonContent>>(
      `/content/lesson/${lessonId}/upload?fileType=${fileType}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return res.data.data!;
  },
};
