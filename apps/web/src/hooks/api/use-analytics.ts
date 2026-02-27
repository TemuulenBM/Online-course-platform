'use client';

import { useQuery } from '@tanstack/react-query';
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

/** Платформын статистик */
export function usePlatformStats() {
  return useQuery({
    queryKey: QUERY_KEYS.analytics.platformStats,
    queryFn: () => analyticsService.getPlatformStats(),
  });
}

/** Хүлээгдэж буй зүйлүүд */
export function usePendingItems() {
  return useQuery({
    queryKey: QUERY_KEYS.analytics.pendingItems,
    queryFn: () => analyticsService.getPendingItems(),
  });
}

/** Сүүлийн admin үйлдлүүд */
export function useRecentActivity(limit?: number) {
  return useQuery({
    queryKey: QUERY_KEYS.analytics.recentActivity(limit),
    queryFn: () => analyticsService.getRecentActivity(limit),
  });
}
