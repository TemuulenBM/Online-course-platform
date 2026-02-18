import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { CreatePostUseCase } from '../../application/use-cases/create-post.use-case';
import { DiscussionPostRepository } from '../../infrastructure/repositories/discussion-post.repository';
import { DiscussionCacheService } from '../../infrastructure/services/discussion-cache.service';
import { CourseRepository } from '../../../courses/infrastructure/repositories/course.repository';
import { EnrollmentRepository } from '../../../enrollments/infrastructure/repositories/enrollment.repository';
import { LessonRepository } from '../../../lessons/infrastructure/repositories/lesson.repository';
import { DiscussionPostEntity } from '../../domain/entities/discussion-post.entity';
import { CourseEntity } from '../../../courses/domain/entities/course.entity';
import { EnrollmentEntity } from '../../../enrollments/domain/entities/enrollment.entity';

describe('CreatePostUseCase', () => {
  let useCase: CreatePostUseCase;
  let courseRepository: jest.Mocked<CourseRepository>;
  let enrollmentRepository: jest.Mocked<EnrollmentRepository>;
  let lessonRepository: jest.Mocked<LessonRepository>;
  let postRepository: jest.Mocked<DiscussionPostRepository>;
  // DiscussionCacheService provider шаардлагатай (use case-д inject хийгддэг)

  const now = new Date();

  /** Тестэд ашиглах mock нийтлэгдсэн сургалт */
  const mockPublishedCourse = new CourseEntity({
    id: 'course-1',
    title: 'Test Course',
    slug: 'test-course',
    description: 'Test description',
    instructorId: 'instructor-1',
    categoryId: 'category-1',
    price: 0,
    discountPrice: null,
    difficulty: 'beginner',
    language: 'mn',
    status: 'published',
    thumbnailUrl: null,
    durationMinutes: 60,
    publishedAt: now,
    createdAt: now,
    updatedAt: now,
  });

  /** Тестэд ашиглах mock draft сургалт */
  const mockDraftCourse = new CourseEntity({
    id: 'course-2',
    title: 'Draft Course',
    slug: 'draft-course',
    description: 'Draft description',
    instructorId: 'instructor-1',
    categoryId: 'category-1',
    price: 0,
    discountPrice: null,
    difficulty: 'beginner',
    language: 'mn',
    status: 'draft',
    thumbnailUrl: null,
    durationMinutes: 60,
    publishedAt: null,
    createdAt: now,
    updatedAt: now,
  });

  /** Тестэд ашиглах mock элсэлт (ACTIVE) */
  const mockActiveEnrollment = new EnrollmentEntity({
    id: 'enrollment-1',
    userId: 'user-1',
    courseId: 'course-1',
    status: 'active',
    enrolledAt: now,
    expiresAt: null,
    completedAt: null,
    createdAt: now,
    updatedAt: now,
  });

  /** Тестэд ашиглах mock нийтлэл */
  const mockPost = new DiscussionPostEntity({
    id: 'post-1',
    courseId: 'course-1',
    authorId: 'user-1',
    postType: 'question',
    title: 'Test Question',
    content: 'Test content',
    contentHtml: '<p>Test content</p>',
    isAnswered: false,
    upvotes: 0,
    downvotes: 0,
    voteScore: 0,
    replies: [],
    voters: [],
    tags: ['nestjs'],
    viewsCount: 0,
    isPinned: false,
    isLocked: false,
    isFlagged: false,
    createdAt: now,
    updatedAt: now,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreatePostUseCase,
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
          provide: LessonRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: DiscussionPostRepository,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: DiscussionCacheService,
          useValue: {
            invalidatePost: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<CreatePostUseCase>(CreatePostUseCase);
    courseRepository = module.get(CourseRepository);
    enrollmentRepository = module.get(EnrollmentRepository);
    lessonRepository = module.get(LessonRepository);
    postRepository = module.get(DiscussionPostRepository);
    module.get(DiscussionCacheService);
  });

  it('амжилттай нийтлэл үүсгэх', async () => {
    courseRepository.findById.mockResolvedValue(mockPublishedCourse);
    enrollmentRepository.findByUserAndCourse.mockResolvedValue(mockActiveEnrollment);
    postRepository.create.mockResolvedValue(mockPost);

    const dto = {
      courseId: 'course-1',
      postType: 'question',
      title: 'Test Question',
      content: 'Test content',
      contentHtml: '<p>Test content</p>',
      tags: ['nestjs'],
    };

    const result = await useCase.execute('user-1', 'STUDENT', dto);

    expect(result).toEqual(mockPost);
    expect(courseRepository.findById).toHaveBeenCalledWith('course-1');
    expect(enrollmentRepository.findByUserAndCourse).toHaveBeenCalledWith('user-1', 'course-1');
    expect(postRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        courseId: 'course-1',
        authorId: 'user-1',
        postType: 'question',
        title: 'Test Question',
        content: 'Test content',
        contentHtml: '<p>Test content</p>',
        tags: ['nestjs'],
      }),
    );
  });

  it('сургалт олдоогүй бол NotFoundException', async () => {
    courseRepository.findById.mockResolvedValue(null);

    const dto = {
      courseId: 'non-existent',
      postType: 'question',
      title: 'Test',
      content: 'Test',
      contentHtml: '<p>Test</p>',
    };

    await expect(useCase.execute('user-1', 'STUDENT', dto)).rejects.toThrow(NotFoundException);
    expect(courseRepository.findById).toHaveBeenCalledWith('non-existent');
  });

  it('нийтлэгдээгүй сургалтад BadRequestException', async () => {
    courseRepository.findById.mockResolvedValue(mockDraftCourse);

    const dto = {
      courseId: 'course-2',
      postType: 'question',
      title: 'Test',
      content: 'Test',
      contentHtml: '<p>Test</p>',
    };

    await expect(useCase.execute('user-1', 'STUDENT', dto)).rejects.toThrow(BadRequestException);
  });

  it('элсэлтгүй хэрэглэгчид ForbiddenException', async () => {
    courseRepository.findById.mockResolvedValue(mockPublishedCourse);
    enrollmentRepository.findByUserAndCourse.mockResolvedValue(null);

    const dto = {
      courseId: 'course-1',
      postType: 'question',
      title: 'Test',
      content: 'Test',
      contentHtml: '<p>Test</p>',
    };

    await expect(useCase.execute('user-1', 'STUDENT', dto)).rejects.toThrow(ForbiddenException);
  });

  it('хичээл олдоогүй бол NotFoundException (lessonId өгөгдсөн үед)', async () => {
    courseRepository.findById.mockResolvedValue(mockPublishedCourse);
    enrollmentRepository.findByUserAndCourse.mockResolvedValue(mockActiveEnrollment);
    lessonRepository.findById.mockResolvedValue(null);

    const dto = {
      courseId: 'course-1',
      lessonId: 'non-existent-lesson',
      postType: 'question',
      title: 'Test',
      content: 'Test',
      contentHtml: '<p>Test</p>',
    };

    await expect(useCase.execute('user-1', 'STUDENT', dto)).rejects.toThrow(NotFoundException);
    expect(lessonRepository.findById).toHaveBeenCalledWith('non-existent-lesson');
  });

  it('гарчиггүй question төрлийн нийтлэлд BadRequestException', async () => {
    courseRepository.findById.mockResolvedValue(mockPublishedCourse);
    enrollmentRepository.findByUserAndCourse.mockResolvedValue(mockActiveEnrollment);

    const dto = {
      courseId: 'course-1',
      postType: 'question',
      /** title өгөөгүй — question төрөлд заавал шаардлагатай */
      content: 'Test content',
      contentHtml: '<p>Test content</p>',
    };

    await expect(useCase.execute('user-1', 'STUDENT', dto)).rejects.toThrow(BadRequestException);
  });
});
