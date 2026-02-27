import type { ApiResponse } from '@ocp/shared-types';
import apiClient from '../api';

const client = apiClient.getClient();

/** Хариултын бүтэц */
export interface DiscussionReply {
  replyId: string;
  authorId: string;
  authorName?: string;
  authorAvatar?: string;
  content: string;
  contentHtml: string;
  upvotes: number;
  downvotes: number;
  isAccepted: boolean;
  isInstructorReply?: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Нийтлэлийн бүрэн бүтэц (дэлгэрэнгүй) */
export interface DiscussionPost {
  id: string;
  courseId: string;
  lessonId?: string;
  authorId: string;
  authorName?: string;
  authorAvatar?: string;
  postType: 'question' | 'discussion';
  title?: string;
  content: string;
  contentHtml: string;
  isAnswered: boolean;
  acceptedAnswerId?: string;
  upvotes: number;
  downvotes: number;
  voteScore: number;
  replies: DiscussionReply[];
  tags: string[];
  viewsCount: number;
  isPinned: boolean;
  isLocked: boolean;
  isFlagged: boolean;
  flagReason?: string;
  userVote: 'up' | 'down' | null;
  createdAt: string;
  updatedAt: string;
}

/** Жагсаалтын бүтэц (хариултгүй, хөнгөн) */
export interface DiscussionPostListItem {
  id: string;
  courseId: string;
  lessonId?: string;
  authorId: string;
  authorName?: string;
  authorAvatar?: string;
  postType: 'question' | 'discussion';
  title?: string;
  isAnswered: boolean;
  upvotes: number;
  downvotes: number;
  voteScore: number;
  replyCount: number;
  tags: string[];
  viewsCount: number;
  isPinned: boolean;
  isLocked: boolean;
  isFlagged: boolean;
  userVote: 'up' | 'down' | null;
  createdAt: string;
  updatedAt: string;
}

export interface PostsListResponse {
  posts: DiscussionPostListItem[];
  total: number;
  page: number;
  limit: number;
}

export interface PostsListParams {
  page?: number;
  limit?: number;
  postType?: 'question' | 'discussion';
  search?: string;
  tags?: string;
  sortBy?: 'newest' | 'votes' | 'views';
}

export const discussionsService = {
  /** Сургалтын нийтлэлүүдийн жагсаалт */
  listByCourse: async (courseId: string, params?: PostsListParams): Promise<PostsListResponse> => {
    const res = await client.get<ApiResponse<PostsListResponse>>(
      `/discussions/posts/course/${courseId}`,
      { params },
    );
    return res.data.data!;
  },

  /** Нэг нийтлэлийн дэлгэрэнгүй */
  getPost: async (postId: string): Promise<DiscussionPost> => {
    const res = await client.get<ApiResponse<DiscussionPost>>(`/discussions/posts/${postId}`);
    return res.data.data!;
  },

  /** Шинэ нийтлэл үүсгэх */
  createPost: async (data: {
    courseId: string;
    postType: 'question' | 'discussion';
    title?: string;
    content: string;
    contentHtml: string;
    tags?: string[];
  }): Promise<DiscussionPost> => {
    const res = await client.post<ApiResponse<DiscussionPost>>('/discussions/posts', data);
    return res.data.data!;
  },

  /** Нийтлэл шинэчлэх */
  updatePost: async (
    postId: string,
    data: { title?: string; content?: string; contentHtml?: string; tags?: string[] },
  ): Promise<DiscussionPost> => {
    const res = await client.patch<ApiResponse<DiscussionPost>>(
      `/discussions/posts/${postId}`,
      data,
    );
    return res.data.data!;
  },

  /** Нийтлэл устгах */
  deletePost: async (postId: string): Promise<void> => {
    await client.delete(`/discussions/posts/${postId}`);
  },

  /** Нийтлэлд хариулт нэмэх */
  addReply: async (
    postId: string,
    data: { content: string; contentHtml: string },
  ): Promise<DiscussionPost> => {
    const res = await client.post<ApiResponse<DiscussionPost>>(
      `/discussions/posts/${postId}/replies`,
      data,
    );
    return res.data.data!;
  },

  /** Хариулт шинэчлэх */
  updateReply: async (
    postId: string,
    replyId: string,
    data: { content: string; contentHtml: string },
  ): Promise<DiscussionPost> => {
    const res = await client.patch<ApiResponse<DiscussionPost>>(
      `/discussions/posts/${postId}/replies/${replyId}`,
      data,
    );
    return res.data.data!;
  },

  /** Хариулт устгах */
  deleteReply: async (postId: string, replyId: string): Promise<void> => {
    await client.delete(`/discussions/posts/${postId}/replies/${replyId}`);
  },

  /** Санал өгөх (up/down toggle) */
  votePost: async (postId: string, voteType: 'up' | 'down'): Promise<DiscussionPost> => {
    const res = await client.post<ApiResponse<DiscussionPost>>(
      `/discussions/posts/${postId}/vote`,
      { voteType },
    );
    return res.data.data!;
  },

  /** Нийтлэл pin/unpin toggle */
  pinPost: async (postId: string): Promise<DiscussionPost> => {
    const res = await client.post<ApiResponse<DiscussionPost>>(`/discussions/posts/${postId}/pin`);
    return res.data.data!;
  },

  /** Нийтлэл lock/unlock toggle */
  lockPost: async (postId: string): Promise<DiscussionPost> => {
    const res = await client.post<ApiResponse<DiscussionPost>>(`/discussions/posts/${postId}/lock`);
    return res.data.data!;
  },

  /** Нийтлэл flag/unflag toggle */
  flagPost: async (postId: string): Promise<DiscussionPost> => {
    const res = await client.post<ApiResponse<DiscussionPost>>(`/discussions/posts/${postId}/flag`);
    return res.data.data!;
  },

  /** Зөв хариулт хүлээн авах */
  acceptAnswer: async (postId: string, replyId: string): Promise<DiscussionPost> => {
    const res = await client.post<ApiResponse<DiscussionPost>>(
      `/discussions/posts/${postId}/accept/${replyId}`,
    );
    return res.data.data!;
  },
};
