'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { enrollmentsService } from '@/lib/api-services/enrollments.service';
import type { MyEnrollmentsParams } from '@/lib/api-services/enrollments.service';
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
