import type { ApiResponse } from '@ocp/shared-types';
import apiClient from '../api';

const client = apiClient.getClient();

/** Хичээлийн сэтгэгдэл */
export interface LessonComment {
  id: string;
  lessonId: string;
  userId: string;
  content: string;
  parentId?: string;
  upvoteCount: number;
  hasUpvoted?: boolean;
  authorName?: string;
  createdAt: string;
  replies?: LessonComment[];
}

export interface CommentsListResponse {
  comments: LessonComment[];
  total: number;
  page: number;
  limit: number;
}

export interface CommentsListParams {
  page?: number;
  limit?: number;
  sort?: 'recent' | 'popular';
}

export const commentsService = {
  /** Хичээлийн сэтгэгдлүүд */
  listByLesson: async (
    lessonId: string,
    params?: CommentsListParams,
  ): Promise<CommentsListResponse> => {
    const res = await client.get<ApiResponse<CommentsListResponse>>(
      `/discussions/comments/lesson/${lessonId}`,
      { params },
    );
    return res.data.data!;
  },

  /** Сэтгэгдэл бичих */
  create: async (data: { lessonId: string; content: string }): Promise<LessonComment> => {
    const res = await client.post<ApiResponse<LessonComment>>('/discussions/comments', data);
    return res.data.data!;
  },

  /** Сэтгэгдэлд хариулах */
  reply: async (commentId: string, data: { content: string }): Promise<LessonComment> => {
    const res = await client.post<ApiResponse<LessonComment>>(
      `/discussions/comments/${commentId}/replies`,
      data,
    );
    return res.data.data!;
  },

  /** Upvote toggle */
  upvote: async (commentId: string): Promise<LessonComment> => {
    const res = await client.post<ApiResponse<LessonComment>>(
      `/discussions/comments/${commentId}/upvote`,
    );
    return res.data.data!;
  },
};
