import type { ApiResponse } from '@ocp/shared-types';
import type {
  OverviewStats,
  RevenueReport,
  EnrollmentTrend,
  PopularCourseItem,
  CourseStats,
  CourseStudentsResponse,
  LessonStatsItem,
  AnalyticsEventListResponse,
  PlatformStats,
  PendingItems,
  DateRangeParams,
  EventListParams,
} from '@ocp/shared-types';
import type { AuditLogEntry } from './admin.service';
import apiClient from '../api';

const client = apiClient.getClient();

export const analyticsService = {
  /* ======== Dashboard (ADMIN) ======== */

  /** Ерөнхий тоон үзүүлэлтүүд */
  getOverview: async (): Promise<OverviewStats> => {
    const res = await client.get<ApiResponse<OverviewStats>>('/analytics/dashboard/overview');
    return res.data.data!;
  },

  /** Орлогын тайлан */
  getRevenueReport: async (params?: DateRangeParams): Promise<RevenueReport> => {
    const res = await client.get<ApiResponse<RevenueReport>>('/analytics/dashboard/revenue', {
      params,
    });
    return res.data.data!;
  },

  /** Элсэлтийн трэнд */
  getEnrollmentTrend: async (params?: DateRangeParams): Promise<EnrollmentTrend> => {
    const res = await client.get<ApiResponse<EnrollmentTrend>>('/analytics/dashboard/enrollments', {
      params,
    });
    return res.data.data!;
  },

  /** Топ сургалтууд */
  getPopularCourses: async (limit?: number): Promise<PopularCourseItem[]> => {
    const res = await client.get<ApiResponse<PopularCourseItem[]>>(
      '/analytics/dashboard/popular-courses',
      { params: { limit } },
    );
    return res.data.data!;
  },

  /* ======== Course Analytics (TEACHER/ADMIN) ======== */

  /** Сургалтын дэлгэрэнгүй статистик */
  getCourseStats: async (courseId: string): Promise<CourseStats> => {
    const res = await client.get<ApiResponse<CourseStats>>(`/analytics/courses/${courseId}`);
    return res.data.data!;
  },

  /** Сургалтын оюутнуудын ахиц */
  getCourseStudents: async (
    courseId: string,
    params?: { page?: number; limit?: number },
  ): Promise<CourseStudentsResponse> => {
    const res = await client.get<ApiResponse<CourseStudentsResponse>>(
      `/analytics/courses/${courseId}/students`,
      { params },
    );
    return res.data.data!;
  },

  /** Хичээл тус бүрийн статистик */
  getCourseLessons: async (courseId: string): Promise<LessonStatsItem[]> => {
    const res = await client.get<ApiResponse<LessonStatsItem[]>>(
      `/analytics/courses/${courseId}/lessons`,
    );
    return res.data.data!;
  },

  /* ======== Events ======== */

  /** Event жагсаалт (ADMIN) */
  listEvents: async (params?: EventListParams): Promise<AnalyticsEventListResponse> => {
    const res = await client.get<ApiResponse<AnalyticsEventListResponse>>('/analytics/events', {
      params,
    });
    return res.data.data!;
  },

  /** Event бүртгэх (public) */
  trackEvent: async (data: {
    eventName: string;
    eventCategory: string;
    properties?: Record<string, unknown>;
    sessionId?: string;
  }): Promise<{ queued: boolean }> => {
    const res = await client.post<ApiResponse<{ queued: boolean }>>(
      '/analytics/events/track',
      data,
    );
    return res.data.data!;
  },

  /* ======== Admin Dashboard ======== */

  /** Платформын ерөнхий статистик */
  getPlatformStats: async (): Promise<PlatformStats> => {
    const res = await client.get<ApiResponse<PlatformStats>>('/admin/dashboard/stats');
    return res.data.data!;
  },

  /** Хүлээгдэж буй зүйлүүд */
  getPendingItems: async (): Promise<PendingItems> => {
    const res = await client.get<ApiResponse<PendingItems>>('/admin/dashboard/pending');
    return res.data.data!;
  },

  /** Сүүлийн үеийн admin үйлдлүүд */
  getRecentActivity: async (limit?: number): Promise<AuditLogEntry[]> => {
    const res = await client.get<ApiResponse<AuditLogEntry[]>>('/admin/dashboard/activity', {
      params: { limit },
    });
    return res.data.data!;
  },
};
