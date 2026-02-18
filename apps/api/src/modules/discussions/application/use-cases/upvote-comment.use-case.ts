import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { LessonCommentRepository } from '../../infrastructure/repositories/lesson-comment.repository';
import { LessonRepository } from '../../../lessons/infrastructure/repositories/lesson.repository';
import { CourseRepository } from '../../../courses/infrastructure/repositories/course.repository';
import { EnrollmentRepository } from '../../../enrollments/infrastructure/repositories/enrollment.repository';
import { DiscussionCacheService } from '../../infrastructure/services/discussion-cache.service';
import { LessonCommentEntity } from '../../domain/entities/lesson-comment.entity';

/**
 * Хичээлийн сэтгэгдэлд upvote toggle хийх use case.
 * upvoterIds массиваар давхар upvote-оос хамгаална.
 */
@Injectable()
export class UpvoteCommentUseCase {
  private readonly logger = new Logger(UpvoteCommentUseCase.name);

  constructor(
    private readonly commentRepository: LessonCommentRepository,
    private readonly lessonRepository: LessonRepository,
    private readonly courseRepository: CourseRepository,
    private readonly enrollmentRepository: EnrollmentRepository,
    private readonly cacheService: DiscussionCacheService,
  ) {}

  async execute(commentId: string, userId: string, role: string): Promise<LessonCommentEntity> {
    /** 1. Сэтгэгдэл олдох эсэх шалгах */
    const comment = await this.commentRepository.findById(commentId);
    if (!comment) {
      throw new NotFoundException('Сэтгэгдэл олдсонгүй');
    }

    /** 2. Хэрэглэгчийн эрх шалгах — элсэлттэй/багш/ADMIN */
    const lesson = await this.lessonRepository.findById(comment.lessonId);
    if (!lesson) {
      throw new NotFoundException('Хичээл олдсонгүй');
    }

    const isAdmin = role === 'ADMIN';
    const course = await this.courseRepository.findById(lesson.courseId);
    const isInstructor = course?.instructorId === userId;

    if (!isAdmin && !isInstructor) {
      const enrollment = await this.enrollmentRepository.findByUserAndCourse(
        userId,
        lesson.courseId,
      );
      if (!enrollment || !['active', 'completed'].includes(enrollment.status)) {
        throw new ForbiddenException('Энэ үйлдлийг хийх эрхгүй байна');
      }
    }

    /** 3. Upvote toggle */
    const updated = await this.commentRepository.toggleUpvote(commentId, userId);

    if (!updated) {
      throw new NotFoundException('Сэтгэгдэл олдсонгүй');
    }

    /** 4. Кэш устгах */
    await this.cacheService.invalidateComment(commentId);

    this.logger.log(`Upvote toggle: сэтгэгдэл ${commentId} — хэрэглэгч: ${userId}`);

    return updated;
  }
}
