import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { LessonCommentRepository } from '../../infrastructure/repositories/lesson-comment.repository';
import { DiscussionCacheService } from '../../infrastructure/services/discussion-cache.service';
import { LessonCommentEntity } from '../../domain/entities/lesson-comment.entity';

/**
 * Хичээлийн сэтгэгдэл шинэчлэх use case.
 * Сэтгэгдлийн эзэмшигч эсвэл админ зөвхөн засварлах эрхтэй.
 */
@Injectable()
export class UpdateCommentUseCase {
  private readonly logger = new Logger(UpdateCommentUseCase.name);

  constructor(
    private readonly commentRepository: LessonCommentRepository,
    private readonly cacheService: DiscussionCacheService,
  ) {}

  async execute(
    commentId: string,
    userId: string,
    role: string,
    data: { content: string },
  ): Promise<LessonCommentEntity> {
    /** 1. Сэтгэгдэл олдох эсэх шалгах */
    const comment = await this.commentRepository.findById(commentId);
    if (!comment) {
      throw new NotFoundException('Сэтгэгдэл олдсонгүй');
    }

    /** 2. Эрх шалгах: эзэмшигч эсвэл админ */
    if (comment.userId !== userId && role !== 'ADMIN') {
      throw new ForbiddenException('Зөвхөн өөрийн сэтгэгдлийг засварлах боломжтой');
    }

    /** 3. Сэтгэгдэл шинэчлэх */
    const updated = await this.commentRepository.update(commentId, {
      content: data.content,
    });
    if (!updated) {
      throw new NotFoundException('Сэтгэгдэл олдсонгүй');
    }

    /** 4. Кэш устгах */
    await this.cacheService.invalidateComment(commentId);

    this.logger.log(`Сэтгэгдэл шинэчлэгдлээ: ${commentId} — хэрэглэгч: ${userId}`);

    return updated;
  }
}
