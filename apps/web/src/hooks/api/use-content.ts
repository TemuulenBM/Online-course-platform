'use client';

import { useQuery } from '@tanstack/react-query';
import { contentService } from '@/lib/api-services/content.service';
import { QUERY_KEYS } from '@/lib/constants';

/** Хичээлийн контент авах */
export function useLessonContent(lessonId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.content.byLesson(lessonId),
    queryFn: () => contentService.getByLessonId(lessonId),
    enabled: !!lessonId,
  });
}
