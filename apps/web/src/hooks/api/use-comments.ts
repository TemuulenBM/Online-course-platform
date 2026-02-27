'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentsService } from '@/lib/api-services/comments.service';
import type { CommentsListParams } from '@/lib/api-services/comments.service';
import { QUERY_KEYS } from '@/lib/constants';

/** Хичээлийн сэтгэгдлүүд */
export function useLessonComments(lessonId: string, params?: CommentsListParams) {
  return useQuery({
    queryKey: [...QUERY_KEYS.comments.byLesson(lessonId), params],
    queryFn: () => commentsService.listByLesson(lessonId, params),
    enabled: !!lessonId,
  });
}

/** Сэтгэгдэл бичих */
export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { lessonId: string; content: string; timestampSeconds?: number }) =>
      commentsService.create(data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.comments.byLesson(variables.lessonId),
      });
    },
  });
}

/** Сэтгэгдэл шинэчлэх */
export function useUpdateComment(lessonId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, content }: { commentId: string; content: string }) =>
      commentsService.updateComment(commentId, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.comments.byLesson(lessonId),
      });
    },
  });
}

/** Сэтгэгдэл устгах */
export function useDeleteComment(lessonId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => commentsService.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.comments.byLesson(lessonId),
      });
    },
  });
}

/** Сэтгэгдэлд хариулах */
export function useReplyComment(lessonId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, content }: { commentId: string; content: string }) =>
      commentsService.reply(commentId, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.comments.byLesson(lessonId),
      });
    },
  });
}

/** Upvote toggle */
export function useUpvoteComment(lessonId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => commentsService.upvote(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.comments.byLesson(lessonId),
      });
    },
  });
}
