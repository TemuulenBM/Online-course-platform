import { Injectable, Logger } from '@nestjs/common';
import { CourseRepository } from '../../infrastructure/repositories/course.repository';
import { ListCoursesQueryDto } from '../../dto/list-courses-query.dto';

/**
 * Сургалтуудын жагсаалт авах use case.
 * Public endpoint-д status=PUBLISHED default.
 */
@Injectable()
export class ListCoursesUseCase {
  private readonly logger = new Logger(ListCoursesUseCase.name);

  constructor(private readonly courseRepository: CourseRepository) {}

  async execute(query: ListCoursesQueryDto) {
    const result = await this.courseRepository.findMany({
      page: query.page ?? 1,
      limit: query.limit ?? 20,
      status: query.status ?? 'published',
      difficulty: query.difficulty,
      categoryId: query.categoryId,
      instructorId: query.instructorId,
      search: query.search,
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
