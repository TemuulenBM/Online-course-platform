'use client';

import { useQuery } from '@tanstack/react-query';
import { lessonsService } from '@/lib/api-services/lessons.service';
import { QUERY_KEYS } from '@/lib/constants';

/** Сургалтын хичээлүүдийн жагсаалт */
export function useCourseLessons(courseId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.lessons.byCourse(courseId),
    queryFn: () => lessonsService.listByCourse(courseId),
    enabled: !!courseId,
  });
}

/** Нэг хичээлийн дэлгэрэнгүй */
export function useLessonById(lessonId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.lessons.byId(lessonId),
    queryFn: () => lessonsService.getById(lessonId),
    enabled: !!lessonId,
  });
}
