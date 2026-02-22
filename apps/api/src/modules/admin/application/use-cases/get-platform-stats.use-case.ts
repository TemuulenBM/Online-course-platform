import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { AdminCacheService } from '../../infrastructure/services/admin-cache.service';

/** Платформын ерөнхий статистик авах use case */
@Injectable()
export class GetPlatformStatsUseCase {
  private readonly logger = new Logger(GetPlatformStatsUseCase.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: AdminCacheService,
  ) {}

  async execute() {
    const cached = await this.cacheService.getDashboardStats();
    if (cached) return cached;

    const [
      totalUsers,
      totalTeachers,
      totalStudents,
      totalCourses,
      publishedCourses,
      totalEnrollments,
      activeEnrollments,
      totalCertificates,
      totalOrders,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'TEACHER' } }),
      this.prisma.user.count({ where: { role: 'STUDENT' } }),
      this.prisma.course.count(),
      this.prisma.course.count({ where: { status: 'PUBLISHED' } }),
      this.prisma.enrollment.count(),
      this.prisma.enrollment.count({ where: { status: 'ACTIVE' } }),
      this.prisma.certificate.count(),
      this.prisma.order.count(),
    ]);

    const result = {
      users: { total: totalUsers, teachers: totalTeachers, students: totalStudents },
      courses: { total: totalCourses, published: publishedCourses },
      enrollments: { total: totalEnrollments, active: activeEnrollments },
      certificates: { total: totalCertificates },
      orders: { total: totalOrders },
    };

    await this.cacheService.setDashboardStats(result);
    this.logger.debug('Платформын статистик тооцоологдлоо');
    return result;
  }
}
