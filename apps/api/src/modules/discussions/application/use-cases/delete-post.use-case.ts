import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DiscussionPostRepository } from '../../infrastructure/repositories/discussion-post.repository';
import { DiscussionCacheService } from '../../infrastructure/services/discussion-cache.service';

/**
 * Нийтлэл устгах use case.
 * Зөвхөн эзэмшигч эсвэл ADMIN устгах боломжтой.
 */
@Injectable()
export class DeletePostUseCase {
  private readonly logger = new Logger(DeletePostUseCase.name);

  constructor(
    private readonly postRepository: DiscussionPostRepository,
    private readonly cacheService: DiscussionCacheService,
  ) {}

  async execute(userId: string, role: string, postId: string): Promise<void> {
    /** 1. Нийтлэл олох */
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new NotFoundException('Нийтлэл олдсонгүй');
    }

    /** 2. Эзэмшигч эсвэл ADMIN эрх шалгах */
    if (post.authorId !== userId && role !== 'ADMIN') {
      throw new ForbiddenException('Зөвхөн нийтлэлийн эзэмшигч эсвэл админ устгах боломжтой');
    }

    /** 3. Нийтлэл устгах */
    await this.postRepository.delete(postId);

    /** 4. Кэш устгах */
    await this.cacheService.invalidatePost(postId);

    this.logger.log(`Нийтлэл устгагдлаа: ${postId} — хэрэглэгч: ${userId}`);
  }
}
