import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { AddCommentReplyUseCase } from '../../application/use-cases/add-comment-reply.use-case';
import { LessonCommentRepository } from '../../infrastructure/repositories/lesson-comment.repository';
import { LessonRepository } from '../../../lessons/infrastructure/repositories/lesson.repository';
import { CourseRepository } from '../../../courses/infrastructure/repositories/course.repository';
import { EnrollmentRepository } from '../../../enrollments/infrastructure/repositories/enrollment.repository';
import { DiscussionCacheService } from '../../infrastructure/services/discussion-cache.service';
import { LessonCommentEntity } from '../../domain/entities/lesson-comment.entity';
import { LessonEntity } from '../../../lessons/domain/entities/lesson.entity';
import { CourseEntity } from '../../../courses/domain/entities/course.entity';
import { EnrollmentEntity } from '../../../enrollments/domain/entities/enrollment.entity';
import { CommentReplyVO } from '../../domain/value-objects/comment-reply.vo';

describe('AddCommentReplyUseCase', () => {
  let useCase: AddCommentReplyUseCase;
  let commentRepository: jest.Mocked<LessonCommentRepository>;
  let lessonRepository: jest.Mocked<LessonRepository>;
  let courseRepository: jest.Mocked<CourseRepository>;
  let enrollmentRepository: jest.Mocked<EnrollmentRepository>;
  let cacheService: jest.Mocked<DiscussionCacheService>;

  const now = new Date();

  /** Тест өгөгдөл: сэтгэгдэл */
  const mockComment = new LessonCommentEntity({
    id: 'comment-id-1',
    lessonId: 'lesson-id-1',
    userId: 'user-id-1',
    content: 'Анхны сэтгэгдэл',
    upvotes: 0,
    upvoterIds: [],
    replies: [],
    isInstructorReply: false,
    createdAt: now,
    updatedAt: now,
  });

  /** Тест өгөгдөл: хичээл */
  const mockLesson = new LessonEntity({
    id: 'lesson-id-1',
    courseId: 'course-id-1',
    title: 'Хичээл 1',
    orderIndex: 0,
    lessonType: 'VIDEO',
    durationMinutes: 30,
    isPreview: false,
    isPublished: true,
    createdAt: now,
    updatedAt: now,
  });

  /** Тест өгөгдөл: сургалт */
  const mockCourse = new CourseEntity({
    id: 'course-id-1',
    title: 'Сургалт 1',
    slug: 'surgalt-1',
    description: 'Тайлбар',
    instructorId: 'instructor-id-1',
    categoryId: 'cat-id-1',
    price: 0,
    discountPrice: null,
    difficulty: 'beginner',
    language: 'mn',
    status: 'published',
    thumbnailUrl: null,
    durationMinutes: 120,
    publishedAt: now,
    createdAt: now,
    updatedAt: now,
  });

  /** Тест өгөгдөл: элсэлт */
  const mockEnrollment = new EnrollmentEntity({
    id: 'enrollment-id-1',
    userId: 'student-id-1',
    courseId: 'course-id-1',
    status: 'active',
    enrolledAt: now,
    expiresAt: null,
    completedAt: null,
    createdAt: now,
    updatedAt: now,
  });

  /** Тест өгөгдөл: хариулттай сэтгэгдэл */
  const mockCommentWithReply = new LessonCommentEntity({
    id: 'comment-id-1',
    lessonId: 'lesson-id-1',
    userId: 'user-id-1',
    content: 'Анхны сэтгэгдэл',
    upvotes: 0,
    upvoterIds: [],
    replies: [
      new CommentReplyVO({
        replyId: 'reply-id-1',
        userId: 'student-id-1',
        content: 'Хариулт текст',
        upvotes: 0,
        upvoterIds: [],
        createdAt: now,
      }),
    ],
    isInstructorReply: false,
    createdAt: now,
    updatedAt: now,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddCommentReplyUseCase,
        {
          provide: LessonCommentRepository,
          useValue: {
            findById: jest.fn(),
            addReply: jest.fn(),
          },
        },
        {
          provide: LessonRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: CourseRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: EnrollmentRepository,
          useValue: {
            findByUserAndCourse: jest.fn(),
          },
        },
        {
          provide: DiscussionCacheService,
          useValue: {
            invalidateComment: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<AddCommentReplyUseCase>(AddCommentReplyUseCase);
    commentRepository = module.get(LessonCommentRepository);
    lessonRepository = module.get(LessonRepository);
    courseRepository = module.get(CourseRepository);
    enrollmentRepository = module.get(EnrollmentRepository);
    cacheService = module.get(DiscussionCacheService);
  });

  it('амжилттай хариулт нэмэх', async () => {
    /** Элсэлттэй оюутан сэтгэгдэлд хариулт нэмэх */
    commentRepository.findById.mockResolvedValue(mockComment);
    lessonRepository.findById.mockResolvedValue(mockLesson);
    courseRepository.findById.mockResolvedValue(mockCourse);
    enrollmentRepository.findByUserAndCourse.mockResolvedValue(mockEnrollment);
    commentRepository.addReply.mockResolvedValue(mockCommentWithReply);

    const result = await useCase.execute('comment-id-1', 'student-id-1', 'STUDENT', {
      content: 'Хариулт текст',
    });

    expect(result).toBeDefined();
    expect(result.replies).toHaveLength(1);
    expect(result.replies[0].content).toBe('Хариулт текст');
    expect(commentRepository.addReply).toHaveBeenCalledWith(
      'comment-id-1',
      expect.objectContaining({
        userId: 'student-id-1',
        content: 'Хариулт текст',
      }),
    );
    expect(cacheService.invalidateComment).toHaveBeenCalledWith('comment-id-1');
  });

  it('сэтгэгдэл олдоогүй бол NotFoundException', async () => {
    /** Байхгүй сэтгэгдэлд хариулт нэмэх оролдлого */
    commentRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('nonexistent', 'student-id-1', 'STUDENT', {
        content: 'Хариулт',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('элсэлтгүй хэрэглэгчид ForbiddenException', async () => {
    /** Элсэлтгүй хэрэглэгч хариулт нэмэх оролдлого */
    commentRepository.findById.mockResolvedValue(mockComment);
    lessonRepository.findById.mockResolvedValue(mockLesson);
    courseRepository.findById.mockResolvedValue(mockCourse);
    enrollmentRepository.findByUserAndCourse.mockResolvedValue(null);

    await expect(
      useCase.execute('comment-id-1', 'random-user-id', 'STUDENT', {
        content: 'Хариулт',
      }),
    ).rejects.toThrow(ForbiddenException);
  });
});
