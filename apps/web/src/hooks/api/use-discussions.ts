'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { discussionsService } from '@/lib/api-services/discussions.service';
import type { PostsListParams } from '@/lib/api-services/discussions.service';
import { QUERY_KEYS } from '@/lib/constants';

/** Сургалтын хэлэлцүүлгийн нийтлэлүүд */
export function useDiscussionPosts(courseId: string, params?: PostsListParams) {
  return useQuery({
    queryKey: [...QUERY_KEYS.discussions.byCourse(courseId), params],
    queryFn: () => discussionsService.listByCourse(courseId, params),
    enabled: !!courseId,
  });
}

/** Нэг нийтлэлийн дэлгэрэнгүй */
export function useDiscussionPost(postId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.discussions.detail(postId),
    queryFn: () => discussionsService.getPost(postId),
    enabled: !!postId,
  });
}

/** Шинэ нийтлэл үүсгэх */
export function useCreateDiscussionPost(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: discussionsService.createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.discussions.byCourse(courseId),
      });
    },
  });
}

/** Нийтлэл шинэчлэх */
export function useUpdateDiscussionPost(courseId: string, postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      title?: string;
      content?: string;
      contentHtml?: string;
      tags?: string[];
    }) => discussionsService.updatePost(postId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.discussions.detail(postId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.discussions.byCourse(courseId) });
    },
  });
}

/** Нийтлэл устгах */
export function useDeleteDiscussionPost(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => discussionsService.deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.discussions.byCourse(courseId) });
    },
  });
}

/** Нийтлэлд хариулт нэмэх */
export function useAddReply(courseId: string, postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { content: string; contentHtml: string }) =>
      discussionsService.addReply(postId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.discussions.detail(postId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.discussions.byCourse(courseId) });
    },
  });
}

/** Хариулт шинэчлэх */
export function useUpdateReply(courseId: string, postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      replyId,
      content,
      contentHtml,
    }: {
      replyId: string;
      content: string;
      contentHtml: string;
    }) => discussionsService.updateReply(postId, replyId, { content, contentHtml }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.discussions.detail(postId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.discussions.byCourse(courseId) });
    },
  });
}

/** Хариулт устгах */
export function useDeleteReply(courseId: string, postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (replyId: string) => discussionsService.deleteReply(postId, replyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.discussions.detail(postId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.discussions.byCourse(courseId) });
    },
  });
}

/** Санал өгөх (upvote/downvote toggle) */
export function useVoteDiscussionPost(courseId: string, postId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId: id, voteType }: { postId: string; voteType: 'up' | 'down' }) =>
      discussionsService.votePost(id, voteType),
    onSuccess: () => {
      if (postId) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.discussions.detail(postId) });
      }
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.discussions.byCourse(courseId) });
    },
  });
}

/** Нийтлэл pin toggle */
export function usePinPost(courseId: string, postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => discussionsService.pinPost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.discussions.detail(postId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.discussions.byCourse(courseId) });
    },
  });
}

/** Нийтлэл lock toggle */
export function useLockPost(courseId: string, postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => discussionsService.lockPost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.discussions.detail(postId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.discussions.byCourse(courseId) });
    },
  });
}

/** Нийтлэл flag toggle */
export function useFlagPost(courseId: string, postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => discussionsService.flagPost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.discussions.detail(postId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.discussions.byCourse(courseId) });
    },
  });
}

/** Зөв хариулт хүлээн авах */
export function useAcceptAnswer(courseId: string, postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (replyId: string) => discussionsService.acceptAnswer(postId, replyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.discussions.detail(postId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.discussions.byCourse(courseId) });
    },
  });
}
