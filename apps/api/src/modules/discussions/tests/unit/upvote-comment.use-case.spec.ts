import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { UpvoteCommentUseCase } from '../../application/use-cases/upvote-comment.use-case';
import { LessonCommentRepository } from '../../infrastructure/repositories/lesson-comment.repository';
import { LessonRepository } from '../../../lessons/infrastructure/repositories/lesson.repository';
import { CourseRepository } from '../../../courses/infrastructure/repositories/course.repository';
import { EnrollmentRepository } from '../../../enrollments/infrastructure/repositories/enrollment.repository';
import { DiscussionCacheService } from '../../infrastructure/services/discussion-cache.service';
import { LessonCommentEntity } from '../../domain/entities/lesson-comment.entity';
import { LessonEntity } from '../../../lessons/domain/entities/lesson.entity';
import { CourseEntity } from '../../../courses/domain/entities/course.entity';
import { EnrollmentEntity } from '../../../enrollments/domain/entities/enrollment.entity';

describe('UpvoteCommentUseCase', () => {
  let useCase: UpvoteCommentUseCase;
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
    content: 'Upvote хийх сэтгэгдэл',
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

  /** Тест өгөгдөл: upvote хийсний дараах сэтгэгдэл */
  const mockUpvotedComment = new LessonCommentEntity({
    id: 'comment-id-1',
    lessonId: 'lesson-id-1',
    userId: 'user-id-1',
    content: 'Upvote хийх сэтгэгдэл',
    upvotes: 1,
    upvoterIds: ['student-id-1'],
    replies: [],
    isInstructorReply: false,
    createdAt: now,
    updatedAt: now,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpvoteCommentUseCase,
        {
          provide: LessonCommentRepository,
          useValue: {
            findById: jest.fn(),
            toggleUpvote: jest.fn(),
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

    useCase = module.get<UpvoteCommentUseCase>(UpvoteCommentUseCase);
    commentRepository = module.get(LessonCommentRepository);
    lessonRepository = module.get(LessonRepository);
    courseRepository = module.get(CourseRepository);
    enrollmentRepository = module.get(EnrollmentRepository);
    cacheService = module.get(DiscussionCacheService);
  });

  it('амжилттай upvote toggle', async () => {
    /** Элсэлттэй оюутан сэтгэгдэлд upvote toggle хийх */
    commentRepository.findById.mockResolvedValue(mockComment);
    lessonRepository.findById.mockResolvedValue(mockLesson);
    courseRepository.findById.mockResolvedValue(mockCourse);
    enrollmentRepository.findByUserAndCourse.mockResolvedValue(mockEnrollment);
    commentRepository.toggleUpvote.mockResolvedValue(mockUpvotedComment);

    const result = await useCase.execute('comment-id-1', 'student-id-1', 'STUDENT');

    expect(result).toBeDefined();
    expect(result.upvotes).toBe(1);
    expect(result.upvoterIds).toContain('student-id-1');
    expect(commentRepository.toggleUpvote).toHaveBeenCalledWith('comment-id-1', 'student-id-1');
    expect(cacheService.invalidateComment).toHaveBeenCalledWith('comment-id-1');
  });

  it('сэтгэгдэл олдоогүй бол NotFoundException', async () => {
    /** Байхгүй сэтгэгдэлд upvote хийх оролдлого */
    commentRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('nonexistent', 'student-id-1', 'STUDENT')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('элсэлтгүй хэрэглэгчид ForbiddenException', async () => {
    /** Элсэлтгүй хэрэглэгч upvote хийх оролдлого */
    commentRepository.findById.mockResolvedValue(mockComment);
    lessonRepository.findById.mockResolvedValue(mockLesson);
    courseRepository.findById.mockResolvedValue(mockCourse);
    enrollmentRepository.findByUserAndCourse.mockResolvedValue(null);

    await expect(useCase.execute('comment-id-1', 'random-user-id', 'STUDENT')).rejects.toThrow(
      ForbiddenException,
    );
  });
});
