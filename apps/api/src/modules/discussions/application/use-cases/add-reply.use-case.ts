import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { DiscussionPostRepository } from '../../infrastructure/repositories/discussion-post.repository';
import { DiscussionCacheService } from '../../infrastructure/services/discussion-cache.service';
import { CourseRepository } from '../../../courses/infrastructure/repositories/course.repository';
import { EnrollmentRepository } from '../../../enrollments/infrastructure/repositories/enrollment.repository';
import { DiscussionPostEntity } from '../../domain/entities/discussion-post.entity';

/**
 * Нийтлэлд хариулт нэмэх use case.
 * Түгжээгүй нийтлэлд, элсэлттэй/багш/ADMIN хариулт нэмэх боломжтой.
 */
@Injectable()
export class AddReplyUseCase {
  private readonly logger = new Logger(AddReplyUseCase.name);

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
    dto: {
      content: string;
      contentHtml: string;
    },
  ): Promise<DiscussionPostEntity> {
    /** 1. Нийтлэл олох */
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new NotFoundException('Нийтлэл олдсонгүй');
    }

    /** 2. Түгжигдсэн эсэх шалгах */
    if (post.isLocked) {
      throw new BadRequestException('Түгжигдсэн нийтлэлд хариулт нэмэх боломжгүй');
    }

    /** 3. Хэрэглэгчийн эрх шалгах — элсэлттэй/багш/ADMIN */
    const isAdmin = role === 'ADMIN';
    const course = await this.courseRepository.findById(post.courseId);
    const isInstructor = course?.instructorId === userId;
    if (!isAdmin && !isInstructor) {
      const enrollment = await this.enrollmentRepository.findByUserAndCourse(userId, post.courseId);
      if (!enrollment || !['active', 'completed'].includes(enrollment.status)) {
        throw new ForbiddenException('Энэ үйлдлийг хийх эрхгүй байна');
      }
    }

    /** 4. Хариултын ID үүсгэх */
    const replyId = new Types.ObjectId().toString();

    /** 5. Хариулт нэмэх */
    const updated = await this.postRepository.addReply(postId, {
      replyId,
      authorId: userId,
      content: dto.content,
      contentHtml: dto.contentHtml,
    });

    /** 6. Кэш устгах */
    await this.cacheService.invalidatePost(postId);

    this.logger.log(`Хариулт нэмэгдлээ: ${replyId} — нийтлэл: ${postId}, хэрэглэгч: ${userId}`);

    return updated!;
  }
}
