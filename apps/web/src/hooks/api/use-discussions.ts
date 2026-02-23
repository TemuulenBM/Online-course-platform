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

/** Нийтлэлд хариулт нэмэх */
export function useAddReply(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      postId,
      content,
      contentHtml,
    }: {
      postId: string;
      content: string;
      contentHtml: string;
    }) => discussionsService.addReply(postId, { content, contentHtml }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.discussions.byCourse(courseId),
      });
    },
  });
}

/** Санал өгөх (upvote/downvote toggle) */
export function useVoteDiscussionPost(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, voteType }: { postId: string; voteType: 'up' | 'down' }) =>
      discussionsService.votePost(postId, voteType),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.discussions.byCourse(courseId),
      });
    },
  });
}
