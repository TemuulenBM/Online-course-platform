import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DiscussionPostRepository } from '../../infrastructure/repositories/discussion-post.repository';
import { DiscussionCacheService } from '../../infrastructure/services/discussion-cache.service';
import { CourseRepository } from '../../../courses/infrastructure/repositories/course.repository';
import { DiscussionPostEntity } from '../../domain/entities/discussion-post.entity';

/**
 * Нийтлэл түгжих/нээх (lock toggle) use case.
 * Зөвхөн сургалтын багш эсвэл ADMIN хийх боломжтой.
 */
@Injectable()
export class LockPostUseCase {
  private readonly logger = new Logger(LockPostUseCase.name);

  constructor(
    private readonly postRepository: DiscussionPostRepository,
    private readonly courseRepository: CourseRepository,
    private readonly cacheService: DiscussionCacheService,
  ) {}

  async execute(userId: string, role: string, postId: string): Promise<DiscussionPostEntity> {
    /** 1. Нийтлэл олох */
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new NotFoundException('Нийтлэл олдсонгүй');
    }

    /** 2. Сургалтын багш эсвэл ADMIN эрх шалгах */
    const isAdmin = role === 'ADMIN';
    if (!isAdmin) {
      const course = await this.courseRepository.findById(post.courseId);
      if (course?.instructorId !== userId) {
        throw new ForbiddenException('Зөвхөн сургалтын багш эсвэл админ нийтлэл түгжих боломжтой');
      }
    }

    /** 3. isLocked toggle хийх */
    const updated = await this.postRepository.toggleLock(postId, !post.isLocked);

    /** 4. Кэш устгах */
    await this.cacheService.invalidatePost(postId);

    this.logger.log(
      `Нийтлэл ${!post.isLocked ? 'түгжигдлээ' : 'нээгдлээ'}: ${postId} — хэрэглэгч: ${userId}`,
    );

    return updated!;
  }
}
