/**
 * Сургалтын дэлгэрэнгүй статистикийн value object.
 * Нэг сургалтын бүх тоон үзүүлэлтүүд.
 */
export class CourseStats {
  readonly courseId: string;
  readonly courseTitle: string;
  readonly totalEnrollments: number;
  readonly activeEnrollments: number;
  readonly completedEnrollments: number;
  readonly cancelledEnrollments: number;
  readonly completionRate: number;
  readonly totalRevenue: number;
  readonly avgProgress: number;
  readonly totalLessons: number;
  readonly totalCertificates: number;
  readonly totalTimeSpentSeconds: number;

  constructor(props: {
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
  }) {
    this.courseId = props.courseId;
    this.courseTitle = props.courseTitle;
    this.totalEnrollments = Number(props.totalEnrollments) || 0;
    this.activeEnrollments = Number(props.activeEnrollments) || 0;
    this.completedEnrollments = Number(props.completedEnrollments) || 0;
    this.cancelledEnrollments = Number(props.cancelledEnrollments) || 0;
    this.completionRate = Number(props.completionRate) || 0;
    this.totalRevenue = Number(props.totalRevenue) || 0;
    this.avgProgress = Number(props.avgProgress) || 0;
    this.totalLessons = Number(props.totalLessons) || 0;
    this.totalCertificates = Number(props.totalCertificates) || 0;
    this.totalTimeSpentSeconds = Number(props.totalTimeSpentSeconds) || 0;
  }

  /** Сургалтын статистикийг response хэлбэрээр буцаана */
  toResponse() {
    return {
      courseId: this.courseId,
      courseTitle: this.courseTitle,
      totalEnrollments: this.totalEnrollments,
      activeEnrollments: this.activeEnrollments,
      completedEnrollments: this.completedEnrollments,
      cancelledEnrollments: this.cancelledEnrollments,
      completionRate: this.completionRate,
      totalRevenue: this.totalRevenue,
      avgProgress: this.avgProgress,
      totalLessons: this.totalLessons,
      totalCertificates: this.totalCertificates,
      totalTimeSpentSeconds: this.totalTimeSpentSeconds,
    };
  }
}

/** Топ сургалтын жагсаалтын item */
export class PopularCourseItem {
  readonly courseId: string;
  readonly courseTitle: string;
  readonly enrollmentCount: number;
  readonly completionCount: number;
  readonly revenue: number;

  constructor(props: {
    courseId: string;
    courseTitle: string;
    enrollmentCount: number;
    completionCount: number;
    revenue: number;
  }) {
    this.courseId = props.courseId;
    this.courseTitle = props.courseTitle;
    this.enrollmentCount = Number(props.enrollmentCount) || 0;
    this.completionCount = Number(props.completionCount) || 0;
    this.revenue = Number(props.revenue) || 0;
  }

  toResponse() {
    return {
      courseId: this.courseId,
      courseTitle: this.courseTitle,
      enrollmentCount: this.enrollmentCount,
      completionCount: this.completionCount,
      revenue: this.revenue,
    };
  }
}
