import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { VotePostUseCase } from '../../application/use-cases/vote-post.use-case';
import { DiscussionPostRepository } from '../../infrastructure/repositories/discussion-post.repository';
import { DiscussionCacheService } from '../../infrastructure/services/discussion-cache.service';
import { CourseRepository } from '../../../courses/infrastructure/repositories/course.repository';
import { EnrollmentRepository } from '../../../enrollments/infrastructure/repositories/enrollment.repository';
import { DiscussionPostEntity } from '../../domain/entities/discussion-post.entity';
import { VoterVO } from '../../domain/value-objects/voter.vo';
import { CourseEntity } from '../../../courses/domain/entities/course.entity';
import { EnrollmentEntity } from '../../../enrollments/domain/entities/enrollment.entity';

describe('VotePostUseCase', () => {
  let useCase: VotePostUseCase;
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

  /** Тестэд ашиглах mock нийтлэл (санал байхгүй) */
  const mockPostNoVotes = new DiscussionPostEntity({
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

  /** Тестэд ашиглах mock нийтлэл (user-1 upvote хийсэн) */
  const mockPostWithUpvote = new DiscussionPostEntity({
    id: 'post-1',
    courseId: 'course-1',
    authorId: 'author-1',
    postType: 'question',
    title: 'Test Question',
    content: 'Test content',
    contentHtml: '<p>Test content</p>',
    isAnswered: false,
    upvotes: 1,
    downvotes: 0,
    voteScore: 1,
    replies: [],
    voters: [new VoterVO({ userId: 'user-1', voteType: 'up' })],
    tags: [],
    viewsCount: 0,
    isPinned: false,
    isLocked: false,
    isFlagged: false,
    createdAt: now,
    updatedAt: now,
  });

  /** Санал нэмэгдсэний дараах буцаах утга */
  const mockPostAfterVote = new DiscussionPostEntity({
    id: 'post-1',
    courseId: 'course-1',
    authorId: 'author-1',
    postType: 'question',
    title: 'Test Question',
    content: 'Test content',
    contentHtml: '<p>Test content</p>',
    isAnswered: false,
    upvotes: 1,
    downvotes: 0,
    voteScore: 1,
    replies: [],
    voters: [new VoterVO({ userId: 'user-1', voteType: 'up' })],
    tags: [],
    viewsCount: 0,
    isPinned: false,
    isLocked: false,
    isFlagged: false,
    createdAt: now,
    updatedAt: now,
  });

  /** Санал хасагдсаны дараах буцаах утга */
  const mockPostAfterRemoveVote = new DiscussionPostEntity({
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

  /** Санал солигдсоны дараах буцаах утга */
  const mockPostAfterSwap = new DiscussionPostEntity({
    id: 'post-1',
    courseId: 'course-1',
    authorId: 'author-1',
    postType: 'question',
    title: 'Test Question',
    content: 'Test content',
    contentHtml: '<p>Test content</p>',
    isAnswered: false,
    upvotes: 0,
    downvotes: 1,
    voteScore: -1,
    replies: [],
    voters: [new VoterVO({ userId: 'user-1', voteType: 'down' })],
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
        VotePostUseCase,
        {
          provide: DiscussionPostRepository,
          useValue: {
            findById: jest.fn(),
            addVote: jest.fn(),
            removeVote: jest.fn(),
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

    useCase = module.get<VotePostUseCase>(VotePostUseCase);
    postRepository = module.get(DiscussionPostRepository);
    courseRepository = module.get(CourseRepository);
    enrollmentRepository = module.get(EnrollmentRepository);
    cacheService = module.get(DiscussionCacheService);
  });

  it('шинэ upvote нэмэх', async () => {
    postRepository.findById.mockResolvedValue(mockPostNoVotes);
    courseRepository.findById.mockResolvedValue(mockCourse);
    enrollmentRepository.findByUserAndCourse.mockResolvedValue(mockEnrollment);
    postRepository.addVote.mockResolvedValue(mockPostAfterVote);
    cacheService.invalidatePost.mockResolvedValue(undefined);

    const result = await useCase.execute('user-1', 'STUDENT', 'post-1', 'up');

    expect(result).toEqual(mockPostAfterVote);
    expect(postRepository.addVote).toHaveBeenCalledWith('post-1', 'user-1', 'up');
    expect(cacheService.invalidatePost).toHaveBeenCalledWith('post-1');
  });

  it('ижил санал toggle (хасагдах)', async () => {
    /** user-1 аль хэдийн upvote хийсэн, дахин upvote хийвэл хасагдана */
    postRepository.findById.mockResolvedValue(mockPostWithUpvote);
    courseRepository.findById.mockResolvedValue(mockCourse);
    enrollmentRepository.findByUserAndCourse.mockResolvedValue(mockEnrollment);
    postRepository.removeVote.mockResolvedValue(mockPostAfterRemoveVote);
    cacheService.invalidatePost.mockResolvedValue(undefined);

    const result = await useCase.execute('user-1', 'STUDENT', 'post-1', 'up');

    expect(result).toEqual(mockPostAfterRemoveVote);
    expect(postRepository.removeVote).toHaveBeenCalledWith('post-1', 'user-1', 'up');
    /** addVote дуудагдаагүй байх ёстой */
    expect(postRepository.addVote).not.toHaveBeenCalled();
  });

  it('өөр төрлийн санал swap', async () => {
    /** user-1 upvote хийсэн, одоо downvote хийвэл swap хийгдэнэ */
    postRepository.findById.mockResolvedValue(mockPostWithUpvote);
    courseRepository.findById.mockResolvedValue(mockCourse);
    enrollmentRepository.findByUserAndCourse.mockResolvedValue(mockEnrollment);
    postRepository.removeVote.mockResolvedValue(mockPostAfterRemoveVote);
    postRepository.addVote.mockResolvedValue(mockPostAfterSwap);
    cacheService.invalidatePost.mockResolvedValue(undefined);

    const result = await useCase.execute('user-1', 'STUDENT', 'post-1', 'down');

    expect(result).toEqual(mockPostAfterSwap);
    /** Эхлээд хуучин upvote хасагдана */
    expect(postRepository.removeVote).toHaveBeenCalledWith('post-1', 'user-1', 'up');
    /** Дараа нь шинэ downvote нэмэгдэнэ */
    expect(postRepository.addVote).toHaveBeenCalledWith('post-1', 'user-1', 'down');
  });

  it('элсэлтгүй хэрэглэгчид ForbiddenException', async () => {
    postRepository.findById.mockResolvedValue(mockPostNoVotes);
    courseRepository.findById.mockResolvedValue(mockCourse);
    enrollmentRepository.findByUserAndCourse.mockResolvedValue(null);

    await expect(useCase.execute('user-1', 'STUDENT', 'post-1', 'up')).rejects.toThrow(
      ForbiddenException,
    );
    expect(postRepository.addVote).not.toHaveBeenCalled();
  });

  it('нийтлэл олдоогүй бол NotFoundException', async () => {
    postRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('user-1', 'STUDENT', 'non-existent', 'up')).rejects.toThrow(
      NotFoundException,
    );
  });
});
