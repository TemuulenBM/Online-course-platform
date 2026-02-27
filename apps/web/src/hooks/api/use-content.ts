'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contentService } from '@/lib/api-services/content.service';
import type {
  SetTextContentData,
  SetVideoContentData,
  UpdateContentData,
  FileType,
} from '@/lib/api-services/content.service';
import { QUERY_KEYS } from '@/lib/constants';

/** Хичээлийн контент авах */
export function useLessonContent(lessonId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.content.byLesson(lessonId),
    queryFn: () => contentService.getByLessonId(lessonId),
    enabled: !!lessonId,
  });
}

/** Текст контент тавих (upsert) */
export function useSetTextContent(lessonId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SetTextContentData) => contentService.setTextContent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.content.byLesson(lessonId),
      });
    },
  });
}

/** Видео контент тавих (upsert) */
export function useSetVideoContent(lessonId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SetVideoContentData) => contentService.setVideoContent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.content.byLesson(lessonId),
      });
    },
  });
}

/** Контент шинэчлэх */
export function useUpdateContent(lessonId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateContentData) => contentService.updateContent(lessonId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.content.byLesson(lessonId),
      });
    },
  });
}

/** Контент устгах */
export function useDeleteContent(lessonId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => contentService.deleteContent(lessonId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.content.byLesson(lessonId),
      });
    },
  });
}

/** Файл upload хийх */
export function useUploadFile(lessonId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, fileType }: { file: File; fileType: FileType }) =>
      contentService.uploadFile(lessonId, file, fileType),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.content.byLesson(lessonId),
      });
    },
  });
}
