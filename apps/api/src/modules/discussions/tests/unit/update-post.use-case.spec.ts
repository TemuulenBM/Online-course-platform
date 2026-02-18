import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { UpdatePostUseCase } from '../../application/use-cases/update-post.use-case';
import { DiscussionPostRepository } from '../../infrastructure/repositories/discussion-post.repository';
import { DiscussionCacheService } from '../../infrastructure/services/discussion-cache.service';
import { DiscussionPostEntity } from '../../domain/entities/discussion-post.entity';

describe('UpdatePostUseCase', () => {
  let useCase: UpdatePostUseCase;
  let postRepository: jest.Mocked<DiscussionPostRepository>;
  let cacheService: jest.Mocked<DiscussionCacheService>;

  const now = new Date();

  /** Тестэд ашиглах mock нийтлэл (түгжээгүй) */
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

  /** Тестэд ашиглах mock түгжигдсэн нийтлэл */
  const mockLockedPost = new DiscussionPostEntity({
    id: 'post-2',
    courseId: 'course-1',
    authorId: 'user-1',
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

  /** Шинэчлэгдсэн нийтлэл */
  const mockUpdatedPost = new DiscussionPostEntity({
    id: 'post-1',
    courseId: 'course-1',
    authorId: 'user-1',
    postType: 'question',
    title: 'Updated Title',
    content: 'Updated content',
    contentHtml: '<p>Updated content</p>',
    isAnswered: false,
    upvotes: 0,
    downvotes: 0,
    voteScore: 0,
    replies: [],
    voters: [],
    tags: ['nestjs', 'updated'],
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
        UpdatePostUseCase,
        {
          provide: DiscussionPostRepository,
          useValue: {
            findById: jest.fn(),
            update: jest.fn(),
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

    useCase = module.get<UpdatePostUseCase>(UpdatePostUseCase);
    postRepository = module.get(DiscussionPostRepository);
    cacheService = module.get(DiscussionCacheService);
  });

  it('амжилттай нийтлэл шинэчлэх (эзэмшигч)', async () => {
    postRepository.findById.mockResolvedValue(mockPost);
    postRepository.update.mockResolvedValue(mockUpdatedPost);
    cacheService.invalidatePost.mockResolvedValue(undefined);

    const dto = {
      title: 'Updated Title',
      content: 'Updated content',
      contentHtml: '<p>Updated content</p>',
      tags: ['nestjs', 'updated'],
    };

    const result = await useCase.execute('user-1', 'STUDENT', 'post-1', dto);

    expect(result).toEqual(mockUpdatedPost);
    expect(postRepository.findById).toHaveBeenCalledWith('post-1');
    expect(postRepository.update).toHaveBeenCalledWith('post-1', dto);
    expect(cacheService.invalidatePost).toHaveBeenCalledWith('post-1');
  });

  it('нийтлэл олдоогүй бол NotFoundException', async () => {
    postRepository.findById.mockResolvedValue(null);

    const dto = { title: 'Updated' };

    await expect(useCase.execute('user-1', 'STUDENT', 'non-existent', dto)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('өөрийн бус нийтлэлд ForbiddenException', async () => {
    postRepository.findById.mockResolvedValue(mockPost);

    const dto = { title: 'Updated' };

    /** user-2 нь user-1-ийн нийтлэлийг шинэчлэх гэж байна */
    await expect(useCase.execute('user-2', 'STUDENT', 'post-1', dto)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('түгжигдсэн нийтлэлд BadRequestException', async () => {
    postRepository.findById.mockResolvedValue(mockLockedPost);
    cacheService.invalidatePost.mockResolvedValue(undefined);

    const dto = { title: 'Updated' };

    /** Эзэмшигч ч гэсэн түгжигдсэн нийтлэлийг шинэчлэх боломжгүй */
    await expect(useCase.execute('user-1', 'STUDENT', 'post-2', dto)).rejects.toThrow(
      BadRequestException,
    );
  });
});
