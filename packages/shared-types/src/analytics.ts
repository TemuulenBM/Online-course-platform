/** Analytics Dashboard — ерөнхий тоон үзүүлэлтүүд */
export interface OverviewStats {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  totalRevenue: number;
  activeEnrollments: number;
  completedEnrollments: number;
  totalCertificates: number;
  newUsersThisMonth: number;
  newEnrollmentsThisMonth: number;
  revenueThisMonth: number;
}

/** Орлогын тайлан — нэг period item */
export interface RevenueReportItem {
  period: string;
  totalRevenue: number;
  orderCount: number;
}

/** Орлогын тайлан — response */
export interface RevenueReport {
  data: RevenueReportItem[];
  totalRevenue: number;
  totalOrders: number;
}

/** Элсэлтийн трэнд — нэг period item */
export interface EnrollmentTrendItem {
  period: string;
  enrollmentCount: number;
  completedCount: number;
  cancelledCount: number;
}

/** Элсэлтийн трэнд — response */
export interface EnrollmentTrend {
  data: EnrollmentTrendItem[];
  totalEnrollments: number;
  totalCompleted: number;
}

/** Топ сургалтын item */
export interface PopularCourseItem {
  courseId: string;
  courseTitle: string;
  enrollmentCount: number;
  completionCount: number;
  revenue: number;
}

/** Сургалтын дэлгэрэнгүй статистик */
export interface CourseStats {
  courseId: string;
  courseTitle: string;
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  cancelledEnrollments: number;
  completionRate: number;
  totalRevenue: number;
  avgProgress: number;
  totalLessons: number;
  totalCertificates: number;
  totalTimeSpentSeconds: number;
}

/** Сургалтын оюутны ахиц item */
export interface CourseStudentItem {
  userId: string;
  userName: string;
  email: string;
  enrollmentStatus: string;
  enrolledAt: string;
  completedAt: string | null;
  progressPercentage: number;
  completedLessons: number;
  totalLessons: number;
  totalTimeSpentSeconds: number;
}

/** Сургалтын оюутнуудын жагсаалт response */
export interface CourseStudentsResponse {
  data: CourseStudentItem[];
  total: number;
  page: number;
  limit: number;
}

/** Хичээлийн статистик item */
export interface LessonStatsItem {
  lessonId: string;
  lessonTitle: string;
  lessonType: string;
  orderIndex: number;
  totalStudents: number;
  completedStudents: number;
  completionRate: number;
  avgTimeSpentSeconds: number;
  avgProgress: number;
}

/** Analytics event */
export interface AnalyticsEvent {
  id: string;
  userId: string | null;
  eventName: string;
  eventCategory: string;
  properties: Record<string, unknown> | null;
  sessionId: string | null;
  createdAt: string;
}

/** Analytics event жагсаалт response */
export interface AnalyticsEventListResponse {
  data: AnalyticsEvent[];
  total: number;
  page: number;
  limit: number;
}

/** Огнооны хүрээний query параметрүүд */
export interface DateRangeParams {
  period?: 'day' | 'month' | 'year';
  dateFrom?: string;
  dateTo?: string;
}

/** Event жагсаалтын query параметрүүд */
export interface EventListParams {
  page?: number;
  limit?: number;
  eventName?: string;
  eventCategory?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
}

/** Admin platform stats */
export interface PlatformStats {
  users: { total: number; teachers: number; students: number };
  courses: { total: number; published: number };
  enrollments: { total: number; active: number };
  certificates: { total: number };
  orders: { total: number };
}

/** Admin pending items */
export interface PendingItems {
  pendingOrders: number;
  processingOrders: number;
  flaggedPosts: number;
  totalPending: number;
}
