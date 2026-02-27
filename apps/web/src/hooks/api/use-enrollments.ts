'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { enrollmentsService } from '@/lib/api-services/enrollments.service';
import type {
  MyEnrollmentsParams,
  CourseEnrollmentsParams,
} from '@/lib/api-services/enrollments.service';
import { QUERY_KEYS } from '@/lib/constants';

/** Миний элсэлтүүд (pagination + status filter) */
export function useMyEnrollments(params?: MyEnrollmentsParams) {
  return useQuery({
    queryKey: QUERY_KEYS.enrollments.my(params),
    queryFn: () => enrollmentsService.listMy(params),
  });
}

/** Тодорхой сургалтад элсэлтийн статус шалгах */
export function useCheckEnrollment(courseId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.enrollments.check(courseId),
    queryFn: () => enrollmentsService.checkEnrollment(courseId),
    enabled: !!courseId,
  });
}

/** Нэг элсэлтийн дэлгэрэнгүй */
export function useEnrollment(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.enrollments.detail(id),
    queryFn: () => enrollmentsService.getById(id),
    enabled: !!id,
  });
}

/** Сургалтын оюутнуудын жагсаалт (TEACHER/ADMIN) */
export function useCourseEnrollments(courseId: string, params?: CourseEnrollmentsParams) {
  return useQuery({
    queryKey: QUERY_KEYS.enrollments.byCourse(courseId, params),
    queryFn: () => enrollmentsService.listCourseEnrollments(courseId, params),
    enabled: !!courseId,
  });
}

/** Сургалтад элсэх mutation */
export function useEnroll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) => enrollmentsService.enroll(courseId),
    onSuccess: (_data, courseId) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.enrollments.check(courseId),
      });
      queryClient.invalidateQueries({
        queryKey: ['enrollments', 'my'],
      });
    },
  });
}

/** Элсэлт цуцлах mutation */
export function useCancelEnrollment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => enrollmentsService.cancel(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.progress.course(data.courseId),
      });
    },
  });
}

/** Элсэлт дуусгах mutation (ADMIN only) */
export function useCompleteEnrollment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => enrollmentsService.complete(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.progress.course(data.courseId),
      });
    },
  });
}

/** Элсэлт устгах mutation (ADMIN only) */
export function useDeleteEnrollment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => enrollmentsService.deleteEnrollment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
    },
  });
}
