import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { OverviewStats } from '../../domain/entities/overview-stats.entity';
import { RevenueReport, RevenueReportItem } from '../../domain/entities/revenue-report.entity';
import {
  EnrollmentTrend,
  EnrollmentTrendItem,
} from '../../domain/entities/enrollment-trend.entity';
import { PopularCourseItem } from '../../domain/entities/course-stats.entity';
import { CourseStats } from '../../domain/entities/course-stats.entity';
import { LessonStatsItem } from '../../domain/entities/lesson-stats.entity';

/**
 * Analytics нэгтгэлийн repository.
 * Одоо байгаа таблиудаас (users, courses, enrollments, orders, progress, certificates)
 * aggregate query ажиллуулж статистик гаргана.
 */
@Injectable()
export class AnalyticsAggregationRepository {
  private readonly logger = new Logger(AnalyticsAggregationRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Dashboard-ийн ерөнхий тоон үзүүлэлтүүд */
  async getOverview(): Promise<OverviewStats> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsers,
      totalCourses,
      enrollmentCounts,
      totalRevenue,
      totalCertificates,
      newUsersThisMonth,
      newEnrollmentsThisMonth,
      revenueThisMonth,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.course.count({ where: { status: 'PUBLISHED' } }),
      this.prisma.enrollment.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      this.prisma.order.aggregate({
        where: { status: 'PAID' },
        _sum: { amount: true },
      }),
      this.prisma.certificate.count(),
      this.prisma.user.count({
        where: { createdAt: { gte: startOfMonth } },
      }),
      this.prisma.enrollment.count({
        where: { enrolledAt: { gte: startOfMonth } },
      }),
      this.prisma.order.aggregate({
        where: { status: 'PAID', paidAt: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
    ]);

    /** Элсэлтийн статусаар тоолох */
    const statusCounts = enrollmentCounts.reduce(
      (acc, item) => {
        acc[item.status] = item._count.id;
        return acc;
      },
      {} as Record<string, number>,
    );

    return new OverviewStats({
      totalUsers,
      totalCourses,
      totalEnrollments: Object.values(statusCounts).reduce((sum, count) => sum + count, 0),
      totalRevenue: Number(totalRevenue._sum.amount) || 0,
      activeEnrollments: statusCounts['ACTIVE'] || 0,
      completedEnrollments: statusCounts['COMPLETED'] || 0,
      totalCertificates,
      newUsersThisMonth,
      newEnrollmentsThisMonth,
      revenueThisMonth: Number(revenueThisMonth._sum.amount) || 0,
    });
  }

  /** Орлогын тайлан — хугацааны бүлэглэлтэй */
  async getRevenueReport(
    period: 'day' | 'month' | 'year',
    dateFrom: Date,
    dateTo: Date,
  ): Promise<RevenueReport> {
    /** date_trunc()-ийн interval нь SQL identifier — Prisma.raw ашиглана */
    const truncFn = Prisma.raw(`date_trunc('${period}', paid_at)`);

    const rows = await this.prisma.$queryRaw<
      { period: string; total_revenue: number; order_count: number }[]
    >(
      Prisma.sql`
        SELECT
          to_char(${truncFn}, 'YYYY-MM-DD') AS period,
          COALESCE(SUM(amount), 0) AS total_revenue,
          COUNT(*)::int AS order_count
        FROM orders
        WHERE status = 'PAID'
          AND paid_at >= ${dateFrom}
          AND paid_at <= ${dateTo}
        GROUP BY ${truncFn}
        ORDER BY ${truncFn} ASC
      `,
    );

    const items = rows.map(
      (row) =>
        new RevenueReportItem({
          period: row.period,
          totalRevenue: Number(row.total_revenue) || 0,
          orderCount: Number(row.order_count) || 0,
        }),
    );

    return new RevenueReport(items);
  }

  /** Элсэлтийн трэнд — хугацааны бүлэглэлтэй */
  async getEnrollmentTrend(
    period: 'day' | 'month' | 'year',
    dateFrom: Date,
    dateTo: Date,
  ): Promise<EnrollmentTrend> {
    /** date_trunc()-ийн interval нь SQL identifier — Prisma.raw ашиглана */
    const truncFn = Prisma.raw(`date_trunc('${period}', enrolled_at)`);

    const rows = await this.prisma.$queryRaw<
      {
        period: string;
        enrollment_count: number;
        completed_count: number;
        cancelled_count: number;
      }[]
    >(
      Prisma.sql`
        SELECT
          to_char(${truncFn}, 'YYYY-MM-DD') AS period,
          COUNT(*)::int AS enrollment_count,
          COUNT(*) FILTER (WHERE status = 'COMPLETED')::int AS completed_count,
          COUNT(*) FILTER (WHERE status = 'CANCELLED')::int AS cancelled_count
        FROM enrollments
        WHERE enrolled_at >= ${dateFrom}
          AND enrolled_at <= ${dateTo}
        GROUP BY ${truncFn}
        ORDER BY ${truncFn} ASC
      `,
    );

    const items = rows.map(
      (row) =>
        new EnrollmentTrendItem({
          period: row.period,
          enrollmentCount: Number(row.enrollment_count) || 0,
          completedCount: Number(row.completed_count) || 0,
          cancelledCount: Number(row.cancelled_count) || 0,
        }),
    );

    return new EnrollmentTrend(items);
  }

  /** Топ сургалтууд — элсэлт, дуусгалт, орлогоор */
  async getPopularCourses(limit: number): Promise<PopularCourseItem[]> {
    const rows = await this.prisma.$queryRaw<
      {
        course_id: string;
        course_title: string;
        enrollment_count: number;
        completion_count: number;
        revenue: number;
      }[]
    >(
      Prisma.sql`
        SELECT
          c.id AS course_id,
          c.title AS course_title,
          COUNT(DISTINCT e.id)::int AS enrollment_count,
          COUNT(DISTINCT e.id) FILTER (WHERE e.status = 'COMPLETED')::int AS completion_count,
          COALESCE(SUM(o.amount) FILTER (WHERE o.status = 'PAID'), 0) AS revenue
        FROM courses c
        LEFT JOIN enrollments e ON e.course_id = c.id
        LEFT JOIN orders o ON o.course_id = c.id
        WHERE c.status = 'PUBLISHED'
        GROUP BY c.id, c.title
        ORDER BY enrollment_count DESC
        LIMIT ${limit}
      `,
    );

    return rows.map(
      (row) =>
        new PopularCourseItem({
          courseId: row.course_id,
          courseTitle: row.course_title,
          enrollmentCount: Number(row.enrollment_count) || 0,
          completionCount: Number(row.completion_count) || 0,
          revenue: Number(row.revenue) || 0,
        }),
    );
  }

  /** Нэг сургалтын дэлгэрэнгүй статистик */
  async getCourseStats(courseId: string): Promise<CourseStats | null> {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, title: true },
    });

    if (!course) return null;

    const [enrollmentCounts, revenue, lessonCount, certificateCount, avgProgress] =
      await Promise.all([
        this.prisma.enrollment.groupBy({
          by: ['status'],
          where: { courseId },
          _count: { id: true },
        }),
        this.prisma.order.aggregate({
          where: { courseId, status: 'PAID' },
          _sum: { amount: true },
        }),
        this.prisma.lesson.count({
          where: { courseId, isPublished: true },
        }),
        this.prisma.certificate.count({ where: { courseId } }),
        this.prisma.$queryRawUnsafe<{ avg_progress: number; total_time: number }[]>(
          `
            SELECT
              COALESCE(AVG(up.progress_percentage), 0) AS avg_progress,
              COALESCE(SUM(up.time_spent_seconds), 0) AS total_time
            FROM user_progress up
            INNER JOIN lessons l ON l.id = up.lesson_id
            WHERE l.course_id = $1
          `,
          courseId,
        ),
      ]);

    const statusCounts = enrollmentCounts.reduce(
      (acc, item) => {
        acc[item.status] = item._count.id;
        return acc;
      },
      {} as Record<string, number>,
    );

    const totalEnrollments = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);
    const completedEnrollments = statusCounts['COMPLETED'] || 0;
    const completionRate =
      totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0;

    return new CourseStats({
      courseId: course.id,
      courseTitle: course.title,
      totalEnrollments,
      activeEnrollments: statusCounts['ACTIVE'] || 0,
      completedEnrollments,
      cancelledEnrollments: statusCounts['CANCELLED'] || 0,
      completionRate,
      totalRevenue: Number(revenue._sum.amount) || 0,
      avgProgress: Number(avgProgress[0]?.avg_progress) || 0,
      totalLessons: lessonCount,
      totalCertificates: certificateCount,
      totalTimeSpentSeconds: Number(avgProgress[0]?.total_time) || 0,
    });
  }

  /** Сургалтын оюутнуудын ахиц жагсаалт */
  async getCourseStudents(
    courseId: string,
    options: { page: number; limit: number },
  ): Promise<{
    data: {
      userId: string;
      userName: string;
      email: string;
      enrollmentStatus: string;
      enrolledAt: Date;
      completedAt: Date | null;
      progressPercentage: number;
      completedLessons: number;
      totalTimeSpentSeconds: number;
    }[];
    total: number;
    page: number;
    limit: number;
  }> {
    const where = { courseId };

    const [enrollments, total] = await Promise.all([
      this.prisma.enrollment.findMany({
        where,
        skip: (options.page - 1) * options.limit,
        take: options.limit,
        orderBy: { enrolledAt: 'desc' },
        include: {
          user: {
            select: {
              email: true,
              profile: {
                select: { firstName: true, lastName: true },
              },
            },
          },
        },
      }),
      this.prisma.enrollment.count({ where }),
    ]);

    /** Оюутан бүрийн progress мэдээлэл авах */
    const userIds = enrollments.map((e) => e.userId);
    const progressData =
      userIds.length > 0
        ? await this.prisma.$queryRawUnsafe<
            {
              user_id: string;
              avg_progress: number;
              completed_lessons: number;
              total_time: number;
            }[]
          >(
            `
          SELECT
            up.user_id,
            COALESCE(AVG(up.progress_percentage), 0) AS avg_progress,
            COUNT(*) FILTER (WHERE up.completed = true)::int AS completed_lessons,
            COALESCE(SUM(up.time_spent_seconds), 0) AS total_time
          FROM user_progress up
          INNER JOIN lessons l ON l.id = up.lesson_id
          WHERE l.course_id = $1
            AND up.user_id = ANY($2::text[])
          GROUP BY up.user_id
          `,
            courseId,
            userIds,
          )
        : [];

    const progressMap = new Map(progressData.map((p) => [p.user_id, p]));

    const data = enrollments.map((enrollment) => {
      const userName = enrollment.user?.profile
        ? `${enrollment.user.profile.firstName ?? ''} ${enrollment.user.profile.lastName ?? ''}`.trim()
        : '';
      const progress = progressMap.get(enrollment.userId);

      return {
        userId: enrollment.userId,
        userName,
        email: enrollment.user?.email ?? '',
        enrollmentStatus: enrollment.status.toLowerCase(),
        enrolledAt: enrollment.enrolledAt,
        completedAt: enrollment.completedAt,
        progressPercentage: Number(progress?.avg_progress) || 0,
        completedLessons: Number(progress?.completed_lessons) || 0,
        totalTimeSpentSeconds: Number(progress?.total_time) || 0,
      };
    });

    return { data, total, page: options.page, limit: options.limit };
  }

  /** Хичээл тус бүрийн статистик */
  async getCourseLessonStats(courseId: string): Promise<LessonStatsItem[]> {
    const rows = await this.prisma.$queryRawUnsafe<
      {
        lesson_id: string;
        lesson_title: string;
        lesson_type: string;
        order_index: number;
        total_students: number;
        completed_students: number;
        avg_time_spent: number;
        avg_progress: number;
      }[]
    >(
      `
        SELECT
          l.id AS lesson_id,
          l.title AS lesson_title,
          l.lesson_type,
          l.order_index,
          COUNT(DISTINCT up.user_id)::int AS total_students,
          COUNT(DISTINCT up.user_id) FILTER (WHERE up.completed = true)::int AS completed_students,
          COALESCE(AVG(up.time_spent_seconds), 0) AS avg_time_spent,
          COALESCE(AVG(up.progress_percentage), 0) AS avg_progress
        FROM lessons l
        LEFT JOIN user_progress up ON up.lesson_id = l.id
        WHERE l.course_id = $1
          AND l.is_published = true
        GROUP BY l.id, l.title, l.lesson_type, l.order_index
        ORDER BY l.order_index ASC
      `,
      courseId,
    );

    return rows.map((row) => {
      const totalStudents = Number(row.total_students) || 0;
      const completedStudents = Number(row.completed_students) || 0;
      const completionRate =
        totalStudents > 0 ? Math.round((completedStudents / totalStudents) * 100) : 0;

      return new LessonStatsItem({
        lessonId: row.lesson_id,
        lessonTitle: row.lesson_title,
        lessonType: row.lesson_type.toLowerCase(),
        orderIndex: Number(row.order_index),
        totalStudents,
        completedStudents,
        completionRate,
        avgTimeSpentSeconds: Math.round(Number(row.avg_time_spent) || 0),
        avgProgress: Math.round(Number(row.avg_progress) || 0),
      });
    });
  }
}
