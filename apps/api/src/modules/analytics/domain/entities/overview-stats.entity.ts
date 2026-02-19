/**
 * Dashboard-ийн ерөнхий тоон үзүүлэлтүүдийн value object.
 * Бүх таблиудаас aggregate хийсэн нэгдсэн мэдээлэл.
 */
export class OverviewStats {
  readonly totalUsers: number;
  readonly totalCourses: number;
  readonly totalEnrollments: number;
  readonly totalRevenue: number;
  readonly activeEnrollments: number;
  readonly completedEnrollments: number;
  readonly totalCertificates: number;
  readonly newUsersThisMonth: number;
  readonly newEnrollmentsThisMonth: number;
  readonly revenueThisMonth: number;

  constructor(props: {
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
  }) {
    this.totalUsers = props.totalUsers;
    this.totalCourses = props.totalCourses;
    this.totalEnrollments = props.totalEnrollments;
    this.totalRevenue = props.totalRevenue;
    this.activeEnrollments = props.activeEnrollments;
    this.completedEnrollments = props.completedEnrollments;
    this.totalCertificates = props.totalCertificates;
    this.newUsersThisMonth = props.newUsersThisMonth;
    this.newEnrollmentsThisMonth = props.newEnrollmentsThisMonth;
    this.revenueThisMonth = props.revenueThisMonth;
  }

  /** Ерөнхий статистикийг response хэлбэрээр буцаана */
  toResponse() {
    return {
      totalUsers: this.totalUsers,
      totalCourses: this.totalCourses,
      totalEnrollments: this.totalEnrollments,
      totalRevenue: this.totalRevenue,
      activeEnrollments: this.activeEnrollments,
      completedEnrollments: this.completedEnrollments,
      totalCertificates: this.totalCertificates,
      newUsersThisMonth: this.newUsersThisMonth,
      newEnrollmentsThisMonth: this.newEnrollmentsThisMonth,
      revenueThisMonth: this.revenueThisMonth,
    };
  }
}
