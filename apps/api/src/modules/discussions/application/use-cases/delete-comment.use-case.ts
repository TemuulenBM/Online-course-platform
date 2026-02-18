import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { LessonCommentRepository } from '../../infrastructure/repositories/lesson-comment.repository';
import { DiscussionCacheService } from '../../infrastructure/services/discussion-cache.service';

/**
 * Хичээлийн сэтгэгдэл устгах use case.
 * Сэтгэгдлийн эзэмшигч эсвэл админ зөвхөн устгах эрхтэй.
 */
@Injectable()
export class DeleteCommentUseCase {
  private readonly logger = new Logger(DeleteCommentUseCase.name);

  constructor(
    private readonly commentRepository: LessonCommentRepository,
    private readonly cacheService: DiscussionCacheService,
  ) {}

  async execute(commentId: string, userId: string, role: string): Promise<void> {
    /** 1. Сэтгэгдэл олдох эсэх шалгах */
    const comment = await this.commentRepository.findById(commentId);
    if (!comment) {
      throw new NotFoundException('Сэтгэгдэл олдсонгүй');
    }

    /** 2. Эрх шалгах: эзэмшигч эсвэл админ */
    if (comment.userId !== userId && role !== 'ADMIN') {
      throw new ForbiddenException('Зөвхөн өөрийн сэтгэгдлийг устгах боломжтой');
    }

    /** 3. Сэтгэгдэл устгах */
    await this.commentRepository.delete(commentId);

    /** 4. Кэш устгах */
    await this.cacheService.invalidateComment(commentId);

    this.logger.log(`Сэтгэгдэл устгагдлаа: ${commentId} — хэрэглэгч: ${userId}`);
  }
}
