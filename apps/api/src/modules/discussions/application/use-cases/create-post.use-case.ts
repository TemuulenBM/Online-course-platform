import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { DiscussionPostRepository } from '../../infrastructure/repositories/discussion-post.repository';
import { DiscussionCacheService } from '../../infrastructure/services/discussion-cache.service';
import { CourseRepository } from '../../../courses/infrastructure/repositories/course.repository';
import { EnrollmentRepository } from '../../../enrollments/infrastructure/repositories/enrollment.repository';
import { LessonRepository } from '../../../lessons/infrastructure/repositories/lesson.repository';
import { DiscussionPostEntity } from '../../domain/entities/discussion-post.entity';

/**
 * Хэлэлцүүлгийн нийтлэл үүсгэх use case.
 * Сургалт, элсэлт, хичээлийн байдлыг шалгаж нийтлэл үүсгэнэ.
 */
@Injectable()
export class CreatePostUseCase {
  private readonly logger = new Logger(CreatePostUseCase.name);

  constructor(
    private readonly courseRepository: CourseRepository,
    private readonly enrollmentRepository: EnrollmentRepository,
    private readonly lessonRepository: LessonRepository,
    private readonly postRepository: DiscussionPostRepository,
    private readonly cacheService: DiscussionCacheService,
  ) {}

  async execute(
    userId: string,
    role: string,
    dto: {
      courseId: string;
      lessonId?: string;
      postType: string;
      title?: string;
      content: string;
      contentHtml: string;
      tags?: string[];
    },
  ): Promise<DiscussionPostEntity> {
    /** 1. Сургалт олдох эсэх шалгах */
    const course = await this.courseRepository.findById(dto.courseId);
    if (!course) {
      throw new NotFoundException('Сургалт олдсонгүй');
    }

    /** 2. Сургалт нийтлэгдсэн эсэх шалгах */
    if (course.status !== 'published') {
      throw new BadRequestException(
        'Зөвхөн нийтлэгдсэн сургалтын хэлэлцүүлэгт нийтлэл оруулах боломжтой',
      );
    }

    /** 3. Хэрэглэгчийн эрх шалгах — элсэлттэй/багш/ADMIN */
    const isAdmin = role === 'ADMIN';
    const isInstructor = course.instructorId === userId;
    if (!isAdmin && !isInstructor) {
      const enrollment = await this.enrollmentRepository.findByUserAndCourse(userId, dto.courseId);
      if (!enrollment || !['active', 'completed'].includes(enrollment.status)) {
        throw new ForbiddenException('Энэ үйлдлийг хийх эрхгүй байна');
      }
    }

    /** 4. Хичээл байгаа эсэх шалгах (lessonId өгөгдсөн бол) */
    if (dto.lessonId) {
      const lesson = await this.lessonRepository.findById(dto.lessonId);
      if (!lesson) {
        throw new NotFoundException('Хичээл олдсонгүй');
      }
    }

    /** 5. Гарчиг шаардлагатай эсэх шалгах — question, discussion төрлүүдэд */
    if ((dto.postType === 'question' || dto.postType === 'discussion') && !dto.title) {
      throw new BadRequestException(
        'Асуулт болон хэлэлцүүлгийн нийтлэлд гарчиг заавал шаардлагатай',
      );
    }

    /** 6. Нийтлэл үүсгэх */
    const post = await this.postRepository.create({
      courseId: dto.courseId,
      lessonId: dto.lessonId,
      authorId: userId,
      postType: dto.postType,
      title: dto.title,
      content: dto.content,
      contentHtml: dto.contentHtml,
      tags: dto.tags,
    });

    this.logger.log(
      `Нийтлэл үүсгэгдлээ: ${post.id} — хэрэглэгч: ${userId}, сургалт: ${dto.courseId}`,
    );

    return post;
  }
}
