import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Types } from 'mongoose';
import { LessonCommentRepository } from '../../infrastructure/repositories/lesson-comment.repository';
import { LessonRepository } from '../../../lessons/infrastructure/repositories/lesson.repository';
import { CourseRepository } from '../../../courses/infrastructure/repositories/course.repository';
import { EnrollmentRepository } from '../../../enrollments/infrastructure/repositories/enrollment.repository';
import { DiscussionCacheService } from '../../infrastructure/services/discussion-cache.service';
import { LessonCommentEntity } from '../../domain/entities/lesson-comment.entity';
import { sanitizePlainText } from '../../../../common/utils/sanitize.util';

/**
 * Хичээлийн сэтгэгдэлд хариулт нэмэх use case.
 * Элсэлттэй/багш/ADMIN хариулт нэмэх боломжтой.
 */
@Injectable()
export class AddCommentReplyUseCase {
  private readonly logger = new Logger(AddCommentReplyUseCase.name);

  constructor(
    private readonly commentRepository: LessonCommentRepository,
    private readonly lessonRepository: LessonRepository,
    private readonly courseRepository: CourseRepository,
    private readonly enrollmentRepository: EnrollmentRepository,
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

    /** 3. Хариултын ID үүсгэх */
    const replyId = new Types.ObjectId().toString();

    /** 4. XSS хамгаалалт — контентыг цэвэрлэх */
    const cleanContent = sanitizePlainText(data.content);

    /** 5. Хариулт нэмэх */
    const updated = await this.commentRepository.addReply(commentId, {
      replyId,
      userId,
      content: cleanContent,
    });

    if (!updated) {
      throw new NotFoundException('Сэтгэгдэл олдсонгүй');
    }

    /** 5. Кэш устгах */
    await this.cacheService.invalidateComment(commentId);

    this.logger.log(
      `Хариулт нэмэгдлээ: ${replyId} — сэтгэгдэл: ${commentId}, хэрэглэгч: ${userId}`,
    );

    return updated;
  }
}
