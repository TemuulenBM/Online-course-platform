'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { lessonsService } from '@/lib/api-services/lessons.service';
import type {
  CreateLessonData,
  UpdateLessonData,
  ReorderLessonsData,
} from '@/lib/api-services/lessons.service';
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

/** Шинэ хичээл үүсгэх */
export function useCreateLesson(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLessonData) => lessonsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.lessons.byCourse(courseId),
      });
    },
  });
}

/** Хичээл шинэчлэх */
export function useUpdateLesson(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLessonData }) =>
      lessonsService.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.lessons.byCourse(courseId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.lessons.byId(variables.id),
      });
    },
  });
}

/** Хичээл устгах */
export function useDeleteLesson(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => lessonsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.lessons.byCourse(courseId),
      });
    },
  });
}

/** Хичээлийн нийтлэлтийг toggle хийх */
export function useTogglePublishLesson(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => lessonsService.togglePublish(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.lessons.byCourse(courseId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.lessons.byId(id),
      });
    },
  });
}

/** Хичээлүүдийн дарааллыг өөрчлөх */
export function useReorderLessons(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ReorderLessonsData) => lessonsService.reorder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.lessons.byCourse(courseId),
      });
    },
  });
}
