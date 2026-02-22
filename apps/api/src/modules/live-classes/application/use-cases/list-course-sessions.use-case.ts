import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { LiveSessionRepository } from '../../infrastructure/repositories/live-session.repository';
import { CourseRepository } from '../../../courses/infrastructure/repositories/course.repository';
import { EnrollmentRepository } from '../../../enrollments/infrastructure/repositories/enrollment.repository';
import { LiveSessionEntity } from '../../domain/entities/live-session.entity';

/**
 * Сургалтын session жагсаалт авах use case.
 * Enrolled/instructor/ADMIN хандах боломжтой.
 */
@Injectable()
export class ListCourseSessionsUseCase {
  constructor(
    private readonly liveSessionRepository: LiveSessionRepository,
    private readonly courseRepository: CourseRepository,
    private readonly enrollmentRepository: EnrollmentRepository,
  ) {}

  async execute(
    courseId: string,
    userId: string,
    userRole: string,
    options: {
      page: number;
      limit: number;
      status?: string;
      timeFilter?: string;
    },
  ): Promise<{
    data: LiveSessionEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    /** 1. Сургалт олдох эсэх */
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundException('Сургалт олдсонгүй');
    }

    /** 2. Эрхийн шалгалт — enrolled / instructor / ADMIN */
    if (userRole !== 'ADMIN' && course.instructorId !== userId) {
      const enrollment = await this.enrollmentRepository.findByUserAndCourse(userId, courseId);
      if (!enrollment || enrollment.status !== 'active') {
        throw new ForbiddenException('Зөвхөн элсэлттэй хэрэглэгч хандах боломжтой');
      }
    }

    return this.liveSessionRepository.findByCourseId(courseId, options);
  }
}
