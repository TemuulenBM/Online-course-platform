import type { ApiResponse, PaginatedResponse } from '@ocp/shared-types';
import apiClient from '../api';

const client = apiClient.getClient();

/** Хичээлийн ахицын мэдээлэл */
export interface LessonProgress {
  id: string;
  userId: string;
  lessonId: string;
  progressPercentage: number;
  completed: boolean;
  timeSpentSeconds: number;
  lastPositionSeconds: number;
  completedAt: string | null;
  lessonTitle?: string;
  lessonType?: string;
}

/** Сургалтын ахицын нэгтгэл */
export interface CourseProgress {
  totalLessons: number;
  completedLessons: number;
  courseProgressPercentage: number;
  totalTimeSpentSeconds: number;
  lessons: LessonProgressSummary[];
}

export interface LessonProgressSummary {
  lessonId: string;
  lessonTitle: string;
  lessonType: string;
  orderIndex: number;
  progressPercentage: number;
  completed: boolean;
  timeSpentSeconds: number;
  lastPositionSeconds: number;
  completedAt: string | null;
}

export interface MyProgressParams {
  page?: number;
  limit?: number;
}

export const progressService = {
  listMy: async (params?: MyProgressParams): Promise<PaginatedResponse<LessonProgress>> => {
    const res = await client.get<ApiResponse<PaginatedResponse<LessonProgress>>>('/progress/my', {
      params,
    });
    return res.data.data!;
  },

  getCourseProgress: async (courseId: string): Promise<CourseProgress> => {
    const res = await client.get<ApiResponse<CourseProgress>>(`/progress/course/${courseId}`);
    return res.data.data!;
  },

  getLessonProgress: async (lessonId: string): Promise<LessonProgress> => {
    const res = await client.get<ApiResponse<LessonProgress>>(`/progress/lessons/${lessonId}`);
    return res.data.data!;
  },

  completeLesson: async (lessonId: string): Promise<LessonProgress> => {
    const res = await client.post<ApiResponse<LessonProgress>>(
      `/progress/lessons/${lessonId}/complete`,
    );
    return res.data.data!;
  },
};
