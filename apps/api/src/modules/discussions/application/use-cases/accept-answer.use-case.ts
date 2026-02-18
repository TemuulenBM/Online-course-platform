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
 * Хариултыг зөвшөөрөгдсөн хариулт (accepted answer) болгох use case.
 * Зөвхөн question төрлийн нийтлэлд, эзэмшигч эсвэл ADMIN хийх боломжтой.
 */
@Injectable()
export class AcceptAnswerUseCase {
  private readonly logger = new Logger(AcceptAnswerUseCase.name);

  constructor(
    private readonly postRepository: DiscussionPostRepository,
    private readonly cacheService: DiscussionCacheService,
  ) {}

  async execute(
    userId: string,
    role: string,
    postId: string,
    replyId: string,
  ): Promise<DiscussionPostEntity> {
    /** 1. Нийтлэл олох */
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new NotFoundException('Нийтлэл олдсонгүй');
    }

    /** 2. Зөвхөн question төрлийн нийтлэлд хариулт зөвшөөрөх боломжтой */
    if (post.postType !== 'question') {
      throw new BadRequestException('Зөвхөн асуулт төрлийн нийтлэлд хариулт зөвшөөрөх боломжтой');
    }

    /** 3. Эзэмшигч эсвэл ADMIN эрх шалгах */
    if (post.authorId !== userId && role !== 'ADMIN') {
      throw new ForbiddenException(
        'Зөвхөн нийтлэлийн эзэмшигч эсвэл админ хариулт зөвшөөрөх боломжтой',
      );
    }

    /** 4. Хариулт олох */
    const reply = post.replies.find((r) => r.replyId === replyId);
    if (!reply) {
      throw new NotFoundException('Хариулт олдсонгүй');
    }

    /** 5. Хариултыг зөвшөөрөгдсөн болгох */
    const updated = await this.postRepository.acceptAnswer(postId, replyId);

    /** 6. Кэш устгах */
    await this.cacheService.invalidatePost(postId);

    this.logger.log(`Хариулт зөвшөөрөгдлөө: ${replyId} — нийтлэл: ${postId}, хэрэглэгч: ${userId}`);

    return updated!;
  }
}
