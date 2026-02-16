import { Injectable, Logger } from '@nestjs/common';
import { CourseRepository } from '../../infrastructure/repositories/course.repository';
import { ListCoursesQueryDto } from '../../dto/list-courses-query.dto';

/**
 * Миний сургалтуудын жагсаалт авах use case.
 * Багш өөрийн сургалтуудыг бүх статусаар харна.
 */
@Injectable()
export class ListMyCoursesUseCase {
  private readonly logger = new Logger(ListMyCoursesUseCase.name);

  constructor(private readonly courseRepository: CourseRepository) {}

  async execute(instructorId: string, query: ListCoursesQueryDto) {
    const result = await this.courseRepository.findByInstructorId(instructorId, {
      page: query.page ?? 1,
      limit: query.limit ?? 20,
      status: query.status,
    });

    return {
      data: result.data.map((course) => course.toResponse()),
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    };
  }
}
