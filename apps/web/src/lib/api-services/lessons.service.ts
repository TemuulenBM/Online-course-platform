import type { ApiResponse, Lesson } from '@ocp/shared-types';
import apiClient from '../api';

const client = apiClient.getClient();

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
};
