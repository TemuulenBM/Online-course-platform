import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DiscussionPostRepository } from '../../infrastructure/repositories/discussion-post.repository';
import { CourseRepository } from '../../../courses/infrastructure/repositories/course.repository';

/**
 * Сургалтын хэлэлцүүлгийн нийтлэлүүдийг жагсаах use case.
 * Pagination, filter, search, sort дэмжинэ.
 */
@Injectable()
export class ListCoursePostsUseCase {
  private readonly logger = new Logger(ListCoursePostsUseCase.name);

  constructor(
    private readonly courseRepository: CourseRepository,
    private readonly postRepository: DiscussionPostRepository,
  ) {}

  async execute(
    courseId: string,
    currentUserId: string | undefined,
    query: {
      page?: number;
      limit?: number;
      postType?: string;
      tags?: string;
      search?: string;
      sortBy?: 'newest' | 'votes' | 'views';
    },
  ) {
    /** 1. Сургалт олдох эсэх шалгах */
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundException('Сургалт олдсонгүй');
    }

    /** 2. Нийтийн хандалтад зөвхөн нийтлэгдсэн сургалт */
    if (course.status !== 'published') {
      throw new NotFoundException('Сургалт олдсонгүй');
    }

    /** 3. Tags-г comma-separated string-ээс array руу хөрвүүлэх */
    const tags = query.tags
      ? query.tags
          .split(',')
          .map((t) => t.trim())
          .filter((t) => t.length > 0)
      : undefined;

    /** 4. Repository-оос pagination-тэй жагсаалт авах */
    const result = await this.postRepository.findByCourseId(courseId, {
      page: query.page ?? 1,
      limit: query.limit ?? 20,
      postType: query.postType,
      tags,
      search: query.search,
      sortBy: query.sortBy,
    });

    this.logger.debug(`Нийтлэлүүд жагсаагдлаа: сургалт=${courseId}, нийт=${result.total}`);

    return {
      data: result.data.map((post) => post.toListResponse(currentUserId)),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }
}
