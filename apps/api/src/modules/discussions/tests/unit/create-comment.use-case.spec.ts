import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateCommentUseCase } from '../../application/use-cases/create-comment.use-case';
import { LessonCommentRepository } from '../../infrastructure/repositories/lesson-comment.repository';
import { LessonRepository } from '../../../lessons/infrastructure/repositories/lesson.repository';
import { CourseRepository } from '../../../courses/infrastructure/repositories/course.repository';
import { EnrollmentRepository } from '../../../enrollments/infrastructure/repositories/enrollment.repository';
import { DiscussionCacheService } from '../../infrastructure/services/discussion-cache.service';
import { LessonCommentEntity } from '../../domain/entities/lesson-comment.entity';
import { LessonEntity } from '../../../lessons/domain/entities/lesson.entity';
import { CourseEntity } from '../../../courses/domain/entities/course.entity';
import { EnrollmentEntity } from '../../../enrollments/domain/entities/enrollment.entity';

describe('CreateCommentUseCase', () => {
  let useCase: CreateCommentUseCase;
  let lessonRepository: jest.Mocked<LessonRepository>;
  let courseRepository: jest.Mocked<CourseRepository>;
  let enrollmentRepository: jest.Mocked<EnrollmentRepository>;
  let commentRepository: jest.Mocked<LessonCommentRepository>;
  // DiscussionCacheService provider шаардлагатай (use case-д inject хийгддэг)

  const now = new Date();

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

  /** Тест өгөгдөл: сургалт — instructorId = instructor-id-1 */
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

  /** Тест өгөгдөл: сэтгэгдэл */
  const mockComment = new LessonCommentEntity({
    id: 'comment-id-1',
    lessonId: 'lesson-id-1',
    userId: 'student-id-1',
    content: 'Сайн хичээл байна',
    upvotes: 0,
    upvoterIds: [],
    replies: [],
    isInstructorReply: false,
    createdAt: now,
    updatedAt: now,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateCommentUseCase,
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
          provide: LessonCommentRepository,
          useValue: {
            create: jest.fn(),
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

    useCase = module.get<CreateCommentUseCase>(CreateCommentUseCase);
    lessonRepository = module.get(LessonRepository);
    courseRepository = module.get(CourseRepository);
    enrollmentRepository = module.get(EnrollmentRepository);
    commentRepository = module.get(LessonCommentRepository);
    module.get(DiscussionCacheService);
  });

  it('амжилттай сэтгэгдэл үүсгэх', async () => {
    /** Элсэлттэй оюутан амжилттай сэтгэгдэл бичих */
    lessonRepository.findById.mockResolvedValue(mockLesson);
    courseRepository.findById.mockResolvedValue(mockCourse);
    enrollmentRepository.findByUserAndCourse.mockResolvedValue(mockEnrollment);
    commentRepository.create.mockResolvedValue(mockComment);

    const result = await useCase.execute('student-id-1', 'STUDENT', {
      lessonId: 'lesson-id-1',
      content: 'Сайн хичээл байна',
    });

    expect(result).toBeDefined();
    expect(result.id).toBe('comment-id-1');
    expect(result.lessonId).toBe('lesson-id-1');
    expect(result.userId).toBe('student-id-1');
    expect(result.content).toBe('Сайн хичээл байна');
    expect(commentRepository.create).toHaveBeenCalledWith({
      lessonId: 'lesson-id-1',
      userId: 'student-id-1',
      parentCommentId: undefined,
      content: 'Сайн хичээл байна',
      timestampSeconds: undefined,
      isInstructorReply: false,
    });
  });

  it('хичээл олдоогүй бол NotFoundException', async () => {
    /** Байхгүй хичээлд сэтгэгдэл бичих оролдлого */
    lessonRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('student-id-1', 'STUDENT', {
        lessonId: 'nonexistent-lesson',
        content: 'Тест',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('элсэлтгүй хэрэглэгчид ForbiddenException', async () => {
    /** Элсэлтгүй хэрэглэгч сэтгэгдэл бичих оролдлого */
    lessonRepository.findById.mockResolvedValue(mockLesson);
    courseRepository.findById.mockResolvedValue(mockCourse);
    enrollmentRepository.findByUserAndCourse.mockResolvedValue(null);

    await expect(
      useCase.execute('random-user-id', 'STUDENT', {
        lessonId: 'lesson-id-1',
        content: 'Тест',
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('багшийн хариулт isInstructorReply автомат тодорхойлогдох', async () => {
    /** Багш сэтгэгдэл бичихэд isInstructorReply=true байна */
    lessonRepository.findById.mockResolvedValue(mockLesson);
    courseRepository.findById.mockResolvedValue(mockCourse);

    const instructorComment = new LessonCommentEntity({
      id: 'comment-id-2',
      lessonId: 'lesson-id-1',
      userId: 'instructor-id-1',
      content: 'Баярлалаа',
      upvotes: 0,
      upvoterIds: [],
      replies: [],
      isInstructorReply: true,
      createdAt: now,
      updatedAt: now,
    });
    commentRepository.create.mockResolvedValue(instructorComment);

    const result = await useCase.execute('instructor-id-1', 'TEACHER', {
      lessonId: 'lesson-id-1',
      content: 'Баярлалаа',
    });

    expect(result.isInstructorReply).toBe(true);
    /** create дуудалтанд isInstructorReply=true дамжсан эсэхийг шалгах */
    expect(commentRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        isInstructorReply: true,
      }),
    );
  });
});
