import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { LessonCommentRepository } from '../../infrastructure/repositories/lesson-comment.repository';
import { LessonRepository } from '../../../lessons/infrastructure/repositories/lesson.repository';
import { CourseRepository } from '../../../courses/infrastructure/repositories/course.repository';
import { EnrollmentRepository } from '../../../enrollments/infrastructure/repositories/enrollment.repository';
import { DiscussionCacheService } from '../../infrastructure/services/discussion-cache.service';
import { LessonCommentEntity } from '../../domain/entities/lesson-comment.entity';

/**
 * Хичээлийн сэтгэгдэл үүсгэх use case.
 * Хичээл байгаа эсэх, хэрэглэгчийн эрх (элсэлт/багш/админ) шалгаж,
 * шинэ сэтгэгдэл үүсгэнэ.
 */
@Injectable()
export class CreateCommentUseCase {
  private readonly logger = new Logger(CreateCommentUseCase.name);

  constructor(
    private readonly lessonRepository: LessonRepository,
    private readonly courseRepository: CourseRepository,
    private readonly enrollmentRepository: EnrollmentRepository,
    private readonly commentRepository: LessonCommentRepository,
    private readonly cacheService: DiscussionCacheService,
  ) {}

  async execute(
    userId: string,
    role: string,
    data: {
      lessonId: string;
      content: string;
      parentCommentId?: string;
      timestampSeconds?: number;
    },
  ): Promise<LessonCommentEntity> {
    /** 1. Хичээл олдох эсэх шалгах */
    const lesson = await this.lessonRepository.findById(data.lessonId);
    if (!lesson) {
      throw new NotFoundException('Хичээл олдсонгүй');
    }

    /** 2. Хэрэглэгчийн эрх шалгах (элсэлт/багш/админ) */
    const courseId = lesson.courseId;
    const isAdmin = role === 'ADMIN';
    const course = await this.courseRepository.findById(courseId);
    const isInstructor = course?.instructorId === userId;

    if (!isAdmin && !isInstructor) {
      const enrollment = await this.enrollmentRepository.findByUserAndCourse(userId, courseId);
      if (!enrollment || !['active', 'completed'].includes(enrollment.status)) {
        throw new ForbiddenException('Энэ үйлдлийг хийх эрхгүй байна');
      }
    }

    /** 3. Багшийн хариулт эсэхийг автомат тодорхойлох */
    const isInstructorReply = course?.instructorId === userId;

    /** 4. Сэтгэгдэл үүсгэх */
    const comment = await this.commentRepository.create({
      lessonId: data.lessonId,
      userId,
      parentCommentId: data.parentCommentId,
      content: data.content,
      timestampSeconds: data.timestampSeconds,
      isInstructorReply,
    });

    this.logger.log(
      `Сэтгэгдэл үүсгэгдлээ: ${comment.id} — хэрэглэгч: ${userId}, хичээл: ${data.lessonId}`,
    );

    return comment;
  }
}
