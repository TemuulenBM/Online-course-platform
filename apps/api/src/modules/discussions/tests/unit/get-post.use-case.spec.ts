import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetPostUseCase } from '../../application/use-cases/get-post.use-case';
import { DiscussionPostRepository } from '../../infrastructure/repositories/discussion-post.repository';
import { DiscussionCacheService } from '../../infrastructure/services/discussion-cache.service';
import { DiscussionPostEntity } from '../../domain/entities/discussion-post.entity';

describe('GetPostUseCase', () => {
  let useCase: GetPostUseCase;
  let cacheService: jest.Mocked<DiscussionCacheService>;
  let postRepository: jest.Mocked<DiscussionPostRepository>;

  const now = new Date();

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
    upvotes: 5,
    downvotes: 1,
    voteScore: 4,
    replies: [],
    voters: [],
    tags: ['nestjs'],
    viewsCount: 10,
    isPinned: false,
    isLocked: false,
    isFlagged: false,
    createdAt: now,
    updatedAt: now,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetPostUseCase,
        {
          provide: DiscussionCacheService,
          useValue: {
            getPostById: jest.fn(),
          },
        },
        {
          provide: DiscussionPostRepository,
          useValue: {
            incrementViewCount: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<GetPostUseCase>(GetPostUseCase);
    cacheService = module.get(DiscussionCacheService);
    postRepository = module.get(DiscussionPostRepository);
  });

  it('амжилттай нийтлэл авах (кэшээс)', async () => {
    cacheService.getPostById.mockResolvedValue(mockPost);
    postRepository.incrementViewCount.mockResolvedValue(undefined);

    const result = await useCase.execute('post-1');

    expect(result).toEqual(mockPost);
    expect(cacheService.getPostById).toHaveBeenCalledWith('post-1');
  });

  it('нийтлэл олдоогүй бол NotFoundException', async () => {
    cacheService.getPostById.mockResolvedValue(null);

    await expect(useCase.execute('non-existent')).rejects.toThrow(NotFoundException);
    expect(cacheService.getPostById).toHaveBeenCalledWith('non-existent');
  });

  it('viewCount increment дуудагдах', async () => {
    cacheService.getPostById.mockResolvedValue(mockPost);
    postRepository.incrementViewCount.mockResolvedValue(undefined);

    await useCase.execute('post-1');

    /** fire-and-forget байсан ч mock дуудагдсан эсэхийг шалгана */
    expect(postRepository.incrementViewCount).toHaveBeenCalledWith('post-1');
  });
});
