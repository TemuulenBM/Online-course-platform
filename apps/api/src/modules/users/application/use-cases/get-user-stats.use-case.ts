import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';

/** Хэрэглэгчийн статистик response */
export interface UserStatsResponse {
  completedCourses: number;
  activeCourses: number;
  totalCertificates: number;
}

/**
 * Хэрэглэгчийн статистик авах use case.
 * Enrollment болон certificate тоог Prisma-аар тоолно.
 */
@Injectable()
export class GetUserStatsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string): Promise<UserStatsResponse> {
    const [completedCourses, activeCourses, totalCertificates] = await Promise.all([
      this.prisma.enrollment.count({
        where: { userId, status: 'COMPLETED' },
      }),
      this.prisma.enrollment.count({
        where: { userId, status: 'ACTIVE' },
      }),
      this.prisma.certificate.count({
        where: { userId },
      }),
    ]);

    return { completedCourses, activeCourses, totalCertificates };
  }
}
