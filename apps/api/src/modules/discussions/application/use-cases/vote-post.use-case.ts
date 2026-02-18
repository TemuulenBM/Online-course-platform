import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DiscussionPostRepository } from '../../infrastructure/repositories/discussion-post.repository';
import { DiscussionCacheService } from '../../infrastructure/services/discussion-cache.service';
import { CourseRepository } from '../../../courses/infrastructure/repositories/course.repository';
import { EnrollmentRepository } from '../../../enrollments/infrastructure/repositories/enrollment.repository';
import { DiscussionPostEntity } from '../../domain/entities/discussion-post.entity';

/**
 * Нийтлэлд санал өгөх use case.
 * Давхар санал өгвөл хасна (toggle), өөр төрлийн санал өгвөл солино (swap).
 */
@Injectable()
export class VotePostUseCase {
  private readonly logger = new Logger(VotePostUseCase.name);

  constructor(
    private readonly postRepository: DiscussionPostRepository,
    private readonly courseRepository: CourseRepository,
    private readonly enrollmentRepository: EnrollmentRepository,
    private readonly cacheService: DiscussionCacheService,
  ) {}

  async execute(
    userId: string,
    role: string,
    postId: string,
    voteType: 'up' | 'down',
  ): Promise<DiscussionPostEntity> {
    /** 1. Нийтлэл олох */
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new NotFoundException('Нийтлэл олдсонгүй');
    }

    /** 2. Хэрэглэгчийн эрх шалгах — элсэлттэй/багш/ADMIN */
    const isAdmin = role === 'ADMIN';
    const course = await this.courseRepository.findById(post.courseId);
    const isInstructor = course?.instructorId === userId;
    if (!isAdmin && !isInstructor) {
      const enrollment = await this.enrollmentRepository.findByUserAndCourse(userId, post.courseId);
      if (!enrollment || !['active', 'completed'].includes(enrollment.status)) {
        throw new ForbiddenException('Энэ үйлдлийг хийх эрхгүй байна');
      }
    }

    /** 3. Одоогийн санал шалгах */
    const existingVote = post.voters.find((v) => v.userId === userId);

    let updated: DiscussionPostEntity | null;

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        /** Ижил төрлийн санал — toggle off (хасах) */
        updated = await this.postRepository.removeVote(postId, userId, existingVote.voteType);
        this.logger.debug(`Санал хасагдлаа: ${postId} — хэрэглэгч: ${userId}`);
      } else {
        /** Өөр төрлийн санал — swap (хуучныг хасаж шинийг нэмэх) */
        await this.postRepository.removeVote(postId, userId, existingVote.voteType);
        updated = await this.postRepository.addVote(postId, userId, voteType);
        this.logger.debug(
          `Санал солигдлоо: ${postId} — хэрэглэгч: ${userId}, ${existingVote.voteType} → ${voteType}`,
        );
      }
    } else {
      /** Шинэ санал нэмэх */
      updated = await this.postRepository.addVote(postId, userId, voteType);
      this.logger.debug(`Санал нэмэгдлээ: ${postId} — хэрэглэгч: ${userId}, төрөл: ${voteType}`);
    }

    /** 4. Кэш устгах */
    await this.cacheService.invalidatePost(postId);

    return updated!;
  }
}
