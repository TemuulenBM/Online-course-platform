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

export const contentService = {
  /** Хичээлийн контент авах */
  getByLessonId: async (lessonId: string): Promise<LessonContent> => {
    const res = await client.get<ApiResponse<LessonContent>>(`/content/lesson/${lessonId}`);
    return res.data.data!;
  },
};
