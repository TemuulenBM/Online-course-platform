'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coursesService } from '@/lib/api-services/courses.service';
import type {
  CourseListParams,
  CreateCourseData,
  UpdateCourseData,
} from '@/lib/api-services/courses.service';
import { QUERY_KEYS } from '@/lib/constants';

/** Сургалтуудын жагсаалт (pagination + filters) */
export function useCourseList(params?: CourseListParams) {
  return useQuery({
    queryKey: QUERY_KEYS.courses.list(params),
    queryFn: () => coursesService.list(params),
  });
}

/** Slug-аар нэг сургалт авах */
export function useCourseBySlug(slug: string) {
  return useQuery({
    queryKey: QUERY_KEYS.courses.detail(slug),
    queryFn: () => coursesService.getBySlug(slug),
    enabled: !!slug,
  });
}

/** ID-аар нэг сургалт авах */
export function useCourseById(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.courses.byId(id),
    queryFn: () => coursesService.getById(id),
    enabled: !!id,
  });
}

/** Миний сургалтууд (Багш/Админ) */
export function useMyCourses() {
  return useQuery({
    queryKey: QUERY_KEYS.courses.my,
    queryFn: () => coursesService.listMy(),
  });
}

/** Шинэ сургалт үүсгэх */
export function useCreateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCourseData) => coursesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.courses.my });
    },
  });
}

/** Сургалт шинэчлэх */
export function useUpdateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCourseData }) =>
      coursesService.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.courses.my });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.courses.byId(variables.id) });
    },
  });
}

/** Сургалт устгах (ADMIN only) */
export function useDeleteCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => coursesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.courses.my });
    },
  });
}

/** Сургалт нийтлэх (DRAFT → PUBLISHED) */
export function usePublishCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => coursesService.publish(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.courses.my });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.courses.byId(id) });
    },
  });
}

/** Сургалт архивлах (PUBLISHED → ARCHIVED) */
export function useArchiveCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => coursesService.archive(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.courses.my });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.courses.byId(id) });
    },
  });
}
