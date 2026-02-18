import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { DiscussionPostRepository } from '../../infrastructure/repositories/discussion-post.repository';
import { DiscussionCacheService } from '../../infrastructure/services/discussion-cache.service';
import { DiscussionPostEntity } from '../../domain/entities/discussion-post.entity';

/**
 * Нийтлэл шинэчлэх use case.
 * Эзэмшигч эсвэл ADMIN зөвхөн түгжээгүй нийтлэлийг шинэчлэх боломжтой.
 */
@Injectable()
export class UpdatePostUseCase {
  private readonly logger = new Logger(UpdatePostUseCase.name);

  constructor(
    private readonly postRepository: DiscussionPostRepository,
    private readonly cacheService: DiscussionCacheService,
  ) {}

  async execute(
    userId: string,
    role: string,
    postId: string,
    dto: {
      title?: string;
      content?: string;
      contentHtml?: string;
      tags?: string[];
    },
  ): Promise<DiscussionPostEntity> {
    /** 1. Нийтлэл олох */
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new NotFoundException('Нийтлэл олдсонгүй');
    }

    /** 2. Эзэмшигч эсвэл ADMIN эрх шалгах */
    if (post.authorId !== userId && role !== 'ADMIN') {
      throw new ForbiddenException('Зөвхөн нийтлэлийн эзэмшигч эсвэл админ шинэчлэх боломжтой');
    }

    /** 3. Түгжигдсэн эсэх шалгах */
    if (post.isLocked) {
      throw new BadRequestException('Түгжигдсэн нийтлэлийг шинэчлэх боломжгүй');
    }

    /** 4. Нийтлэл шинэчлэх */
    const updated = await this.postRepository.update(postId, {
      title: dto.title,
      content: dto.content,
      contentHtml: dto.contentHtml,
      tags: dto.tags,
    });

    /** 5. Кэш устгах */
    await this.cacheService.invalidatePost(postId);

    this.logger.log(`Нийтлэл шинэчлэгдлээ: ${postId} — хэрэглэгч: ${userId}`);

    return updated!;
  }
}
