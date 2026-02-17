import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { EnrollmentRepository } from '../../infrastructure/repositories/enrollment.repository';
import { CourseRepository } from '../../../courses/infrastructure/repositories/course.repository';
import { ListEnrollmentsQueryDto } from '../../dto/list-enrollments-query.dto';

/**
 * Сургалтын оюутнуудын жагсаалт авах use case.
 * Зөвхөн сургалтын эзэмшигч эсвэл админ хандах боломжтой.
 */
@Injectable()
export class ListCourseEnrollmentsUseCase {
  constructor(
    private readonly enrollmentRepository: EnrollmentRepository,
    private readonly courseRepository: CourseRepository,
  ) {}

  async execute(
    courseId: string,
    currentUserId: string,
    currentUserRole: string,
    query: ListEnrollmentsQueryDto,
  ) {
    /** Сургалт олдох эсэх шалгах */
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundException('Сургалт олдсонгүй');
    }

    /** Эрхийн шалгалт: сургалтын эзэмшигч эсвэл админ */
    if (course.instructorId !== currentUserId && currentUserRole !== 'ADMIN') {
      throw new ForbiddenException('Энэ сургалтын оюутнуудын жагсаалтыг харах эрхгүй');
    }

    const result = await this.enrollmentRepository.findByCourseId(courseId, {
      page: query.page ?? 1,
      limit: query.limit ?? 20,
      status: query.status,
    });

    return {
      data: result.data.map((e) => e.toResponse()),
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    };
  }
}
