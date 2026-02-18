import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { AddReplyUseCase } from '../../application/use-cases/add-reply.use-case';
import { DiscussionPostRepository } from '../../infrastructure/repositories/discussion-post.repository';
import { DiscussionCacheService } from '../../infrastructure/services/discussion-cache.service';
import { CourseRepository } from '../../../courses/infrastructure/repositories/course.repository';
import { EnrollmentRepository } from '../../../enrollments/infrastructure/repositories/enrollment.repository';
import { DiscussionPostEntity } from '../../domain/entities/discussion-post.entity';
import { ReplyVO } from '../../domain/value-objects/reply.vo';
import { CourseEntity } from '../../../courses/domain/entities/course.entity';
import { EnrollmentEntity } from '../../../enrollments/domain/entities/enrollment.entity';

describe('AddReplyUseCase', () => {
  let useCase: AddReplyUseCase;
  let postRepository: jest.Mocked<DiscussionPostRepository>;
  let courseRepository: jest.Mocked<CourseRepository>;
  let enrollmentRepository: jest.Mocked<EnrollmentRepository>;
  let cacheService: jest.Mocked<DiscussionCacheService>;

  const now = new Date();

  /** Тестэд ашиглах mock сургалт */
  const mockCourse = new CourseEntity({
    id: 'course-1',
    title: 'Test Course',
    slug: 'test-course',
    description: 'Test',
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

  /** Тестэд ашиглах mock элсэлт */
  const mockEnrollment = new EnrollmentEntity({
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

  /** Тестэд ашиглах mock нийтлэл (түгжээгүй) */
  const mockPost = new DiscussionPostEntity({
    id: 'post-1',
    courseId: 'course-1',
    authorId: 'author-1',
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
    tags: [],
    viewsCount: 0,
    isPinned: false,
    isLocked: false,
    isFlagged: false,
    createdAt: now,
    updatedAt: now,
  });

  /** Тестэд ашиглах mock түгжигдсэн нийтлэл */
  const mockLockedPost = new DiscussionPostEntity({
    id: 'post-2',
    courseId: 'course-1',
    authorId: 'author-1',
    postType: 'question',
    title: 'Locked Post',
    content: 'Locked content',
    contentHtml: '<p>Locked content</p>',
    isAnswered: false,
    upvotes: 0,
    downvotes: 0,
    voteScore: 0,
    replies: [],
    voters: [],
    tags: [],
    viewsCount: 0,
    isPinned: false,
    isLocked: true,
    isFlagged: false,
    createdAt: now,
    updatedAt: now,
  });

  /** Хариулт нэмэгдсэний дараах нийтлэл */
  const mockPostWithReply = new DiscussionPostEntity({
    id: 'post-1',
    courseId: 'course-1',
    authorId: 'author-1',
    postType: 'question',
    title: 'Test Question',
    content: 'Test content',
    contentHtml: '<p>Test content</p>',
    isAnswered: false,
    upvotes: 0,
    downvotes: 0,
    voteScore: 0,
    replies: [
      new ReplyVO({
        replyId: 'reply-1',
        authorId: 'user-1',
        content: 'Reply content',
        contentHtml: '<p>Reply content</p>',
        upvotes: 0,
        downvotes: 0,
        isAccepted: false,
        createdAt: now,
        updatedAt: now,
      }),
    ],
    voters: [],
    tags: [],
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
        AddReplyUseCase,
        {
          provide: DiscussionPostRepository,
          useValue: {
            findById: jest.fn(),
            addReply: jest.fn(),
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
            invalidatePost: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<AddReplyUseCase>(AddReplyUseCase);
    postRepository = module.get(DiscussionPostRepository);
    courseRepository = module.get(CourseRepository);
    enrollmentRepository = module.get(EnrollmentRepository);
    cacheService = module.get(DiscussionCacheService);
  });

  it('амжилттай хариулт нэмэх', async () => {
    postRepository.findById.mockResolvedValue(mockPost);
    courseRepository.findById.mockResolvedValue(mockCourse);
    enrollmentRepository.findByUserAndCourse.mockResolvedValue(mockEnrollment);
    postRepository.addReply.mockResolvedValue(mockPostWithReply);
    cacheService.invalidatePost.mockResolvedValue(undefined);

    const dto = {
      content: 'Reply content',
      contentHtml: '<p>Reply content</p>',
    };

    const result = await useCase.execute('user-1', 'STUDENT', 'post-1', dto);

    expect(result).toEqual(mockPostWithReply);
    expect(postRepository.findById).toHaveBeenCalledWith('post-1');
    expect(postRepository.addReply).toHaveBeenCalledWith(
      'post-1',
      expect.objectContaining({
        replyId: expect.any(String),
        authorId: 'user-1',
        content: 'Reply content',
        contentHtml: '<p>Reply content</p>',
      }),
    );
    expect(cacheService.invalidatePost).toHaveBeenCalledWith('post-1');
  });

  it('нийтлэл олдоогүй бол NotFoundException', async () => {
    postRepository.findById.mockResolvedValue(null);

    const dto = {
      content: 'Reply content',
      contentHtml: '<p>Reply content</p>',
    };

    await expect(useCase.execute('user-1', 'STUDENT', 'non-existent', dto)).rejects.toThrow(
      NotFoundException,
    );
    expect(postRepository.addReply).not.toHaveBeenCalled();
  });

  it('түгжигдсэн нийтлэлд BadRequestException', async () => {
    postRepository.findById.mockResolvedValue(mockLockedPost);

    const dto = {
      content: 'Reply content',
      contentHtml: '<p>Reply content</p>',
    };

    await expect(useCase.execute('user-1', 'STUDENT', 'post-2', dto)).rejects.toThrow(
      BadRequestException,
    );
    expect(postRepository.addReply).not.toHaveBeenCalled();
  });

  it('элсэлтгүй хэрэглэгчид ForbiddenException', async () => {
    postRepository.findById.mockResolvedValue(mockPost);
    courseRepository.findById.mockResolvedValue(mockCourse);
    enrollmentRepository.findByUserAndCourse.mockResolvedValue(null);

    const dto = {
      content: 'Reply content',
      contentHtml: '<p>Reply content</p>',
    };

    await expect(useCase.execute('user-1', 'STUDENT', 'post-1', dto)).rejects.toThrow(
      ForbiddenException,
    );
    expect(postRepository.addReply).not.toHaveBeenCalled();
  });
});
