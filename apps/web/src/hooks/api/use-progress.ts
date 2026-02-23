'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { progressService } from '@/lib/api-services/progress.service';
import type { MyProgressParams } from '@/lib/api-services/progress.service';
import { QUERY_KEYS } from '@/lib/constants';

/** Миний бүх ахиц (pagination) */
export function useMyProgress(params?: MyProgressParams) {
  return useQuery({
    queryKey: QUERY_KEYS.progress.my(params),
    queryFn: () => progressService.listMy(params),
  });
}

/** Тодорхой сургалтын ахицын нэгтгэл */
export function useCourseProgress(courseId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.progress.course(courseId),
    queryFn: () => progressService.getCourseProgress(courseId),
    enabled: !!courseId,
  });
}

/** Тодорхой хичээлийн ахиц */
export function useLessonProgress(lessonId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.progress.lesson(lessonId),
    queryFn: () => progressService.getLessonProgress(lessonId),
    enabled: !!lessonId,
  });
}

/** Хичээл дуусгах mutation */
export function useCompleteLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (lessonId: string) => progressService.completeLesson(lessonId),
    onSuccess: (_data, lessonId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.progress.lesson(lessonId) });
      queryClient.invalidateQueries({ queryKey: ['progress', 'course'] });
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
    },
  });
}

/** Видеоны байрлал шинэчлэх mutation */
export function useUpdateVideoPosition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      lessonId,
      lastPositionSeconds,
    }: {
      lessonId: string;
      lastPositionSeconds: number;
    }) => progressService.updateVideoPosition(lessonId, { lastPositionSeconds }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.progress.lesson(variables.lessonId),
      });
    },
  });
}
