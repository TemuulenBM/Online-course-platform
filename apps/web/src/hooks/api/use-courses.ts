'use client';

import { useQuery } from '@tanstack/react-query';
import { coursesService } from '@/lib/api-services/courses.service';
import type { CourseListParams } from '@/lib/api-services/courses.service';
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
