import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { LessonCommentRepository } from '../../infrastructure/repositories/lesson-comment.repository';
import { LessonRepository } from '../../../lessons/infrastructure/repositories/lesson.repository';
import { LessonCommentEntity } from '../../domain/entities/lesson-comment.entity';

/**
 * Хичээлийн сэтгэгдлүүдийн жагсаалт авах use case.
 * Хичээл байгаа эсэхийг шалгаж, pagination болон эрэмбэлэлттэй жагсаалт буцаана.
 */
@Injectable()
export class ListLessonCommentsUseCase {
  private readonly logger = new Logger(ListLessonCommentsUseCase.name);

  constructor(
    private readonly lessonRepository: LessonRepository,
    private readonly commentRepository: LessonCommentRepository,
  ) {}

  async execute(
    lessonId: string,
    currentUserId: string | undefined,
    options: {
      page: number;
      limit: number;
      sortBy?: 'newest' | 'upvotes' | 'timestamp';
    },
  ): Promise<{
    data: ReturnType<LessonCommentEntity['toResponse']>[];
    total: number;
    page: number;
    limit: number;
  }> {
    /** 1. Хичээл олдох эсэх шалгах */
    const lesson = await this.lessonRepository.findById(lessonId);
    if (!lesson) {
      throw new NotFoundException('Хичээл олдсонгүй');
    }

    /** 2. Сэтгэгдлүүдийг pagination-тэй авах */
    const result = await this.commentRepository.findByLessonId(lessonId, options);

    this.logger.debug(
      `Хичээлийн сэтгэгдлүүд: lessonId=${lessonId}, нийт=${result.total}, хуудас=${options.page}`,
    );

    /** 3. Response хэлбэрт хөрвүүлж буцаах (hasUpvoted тооцоолоход currentUserId ашиглана) */
    return {
      data: result.data.map((comment) => comment.toResponse(currentUserId)),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }
}
