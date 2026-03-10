'use client';

import { useQuery, useQueries } from '@tanstack/react-query';
import { useMemo } from 'react';
import { analyticsService } from '@/lib/api-services/analytics.service';
import { QUERY_KEYS } from '@/lib/constants';
import type { DateRangeParams, EventListParams } from '@ocp/shared-types';

/* ======== Dashboard (ADMIN) ======== */

/** Ерөнхий тоон үзүүлэлтүүд */
export function useAnalyticsOverview() {
  return useQuery({
    queryKey: QUERY_KEYS.analytics.overview,
    queryFn: () => analyticsService.getOverview(),
  });
}

/** Орлогын тайлан */
export function useRevenueReport(params?: DateRangeParams) {
  return useQuery({
    queryKey: QUERY_KEYS.analytics.revenue(params),
    queryFn: () => analyticsService.getRevenueReport(params),
  });
}

/** Элсэлтийн трэнд */
export function useEnrollmentTrend(params?: DateRangeParams) {
  return useQuery({
    queryKey: QUERY_KEYS.analytics.enrollmentTrend(params),
    queryFn: () => analyticsService.getEnrollmentTrend(params),
  });
}

/** Топ сургалтууд */
export function usePopularCourses(limit?: number) {
  return useQuery({
    queryKey: QUERY_KEYS.analytics.popularCourses(limit),
    queryFn: () => analyticsService.getPopularCourses(limit),
  });
}

/* ======== Course Analytics (TEACHER/ADMIN) ======== */

/** Сургалтын дэлгэрэнгүй статистик */
export function useCourseStats(courseId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.analytics.courseStats(courseId),
    queryFn: () => analyticsService.getCourseStats(courseId),
    enabled: !!courseId,
  });
}

/** Сургалтын оюутнуудын ахиц */
export function useCourseAnalyticsStudents(
  courseId: string,
  params?: { page?: number; limit?: number },
) {
  return useQuery({
    queryKey: QUERY_KEYS.analytics.courseStudents(courseId, params),
    queryFn: () => analyticsService.getCourseStudents(courseId, params),
    enabled: !!courseId,
  });
}

/** Хичээл тус бүрийн статистик */
export function useCourseLessonStats(courseId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.analytics.courseLessons(courseId),
    queryFn: () => analyticsService.getCourseLessons(courseId),
    enabled: !!courseId,
  });
}

/* ======== Events (ADMIN) ======== */

/** Event жагсаалт */
export function useAnalyticsEvents(params?: EventListParams) {
  return useQuery({
    queryKey: QUERY_KEYS.analytics.events(params),
    queryFn: () => analyticsService.listEvents(params),
  });
}

/* ======== Admin Dashboard ======== */

/** Платформын статистик — удаан өөрчлөгддөг тул 10 мин кэш */
export function usePlatformStats() {
  return useQuery({
    queryKey: QUERY_KEYS.analytics.platformStats,
    queryFn: () => analyticsService.getPlatformStats(),
    staleTime: 10 * 60 * 1000,
  });
}

/** Хүлээгдэж буй зүйлүүд — dynamic тул 2 мин кэш */
export function usePendingItems() {
  return useQuery({
    queryKey: QUERY_KEYS.analytics.pendingItems,
    queryFn: () => analyticsService.getPendingItems(),
    staleTime: 2 * 60 * 1000,
  });
}

/** Сүүлийн admin үйлдлүүд */
export function useRecentActivity(limit?: number) {
  return useQuery({
    queryKey: QUERY_KEYS.analytics.recentActivity(limit),
    queryFn: () => analyticsService.getRecentActivity(limit),
  });
}

/* ======== Teacher Overview (Multi-course) ======== */

/** Олон сургалтын stats-г зэрэг авч, нэгдсэн тоо тооцоолно */
export function useMultipleCourseStats(courseIds: string[]) {
  const queries = useQueries({
    queries: courseIds.map((id) => ({
      queryKey: QUERY_KEYS.analytics.courseStats(id),
      queryFn: () => analyticsService.getCourseStats(id),
      enabled: !!id,
    })),
  });

  const isLoading = queries.some((q) => q.isLoading);

  const aggregated = useMemo(() => {
    const loaded = queries.filter((q) => q.data);
    if (loaded.length === 0) {
      return { totalStudents: 0, avgCompletionRate: 0, totalRevenue: 0, totalCertificates: 0 };
    }
    return {
      totalStudents: loaded.reduce((s, q) => s + (q.data?.totalEnrollments ?? 0), 0),
      avgCompletionRate: Math.round(
        loaded.reduce((s, q) => s + (q.data?.completionRate ?? 0), 0) / loaded.length,
      ),
      totalRevenue: loaded.reduce((s, q) => s + (q.data?.totalRevenue ?? 0), 0),
      totalCertificates: loaded.reduce((s, q) => s + (q.data?.totalCertificates ?? 0), 0),
    };
  }, [queries]);

  return { queries, aggregated, isLoading };
}
