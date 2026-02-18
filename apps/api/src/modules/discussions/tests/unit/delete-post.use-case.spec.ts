import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { DeletePostUseCase } from '../../application/use-cases/delete-post.use-case';
import { DiscussionPostRepository } from '../../infrastructure/repositories/discussion-post.repository';
import { DiscussionCacheService } from '../../infrastructure/services/discussion-cache.service';
import { DiscussionPostEntity } from '../../domain/entities/discussion-post.entity';

describe('DeletePostUseCase', () => {
  let useCase: DeletePostUseCase;
  let postRepository: jest.Mocked<DiscussionPostRepository>;
  let cacheService: jest.Mocked<DiscussionCacheService>;

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeletePostUseCase,
        {
          provide: DiscussionPostRepository,
          useValue: {
            findById: jest.fn(),
            delete: jest.fn(),
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

    useCase = module.get<DeletePostUseCase>(DeletePostUseCase);
    postRepository = module.get(DiscussionPostRepository);
    cacheService = module.get(DiscussionCacheService);
  });

  it('амжилттай устгах', async () => {
    postRepository.findById.mockResolvedValue(mockPost);
    postRepository.delete.mockResolvedValue(undefined);
    cacheService.invalidatePost.mockResolvedValue(undefined);

    await useCase.execute('user-1', 'STUDENT', 'post-1');

    expect(postRepository.findById).toHaveBeenCalledWith('post-1');
    expect(postRepository.delete).toHaveBeenCalledWith('post-1');
    expect(cacheService.invalidatePost).toHaveBeenCalledWith('post-1');
  });

  it('нийтлэл олдоогүй бол NotFoundException', async () => {
    postRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('user-1', 'STUDENT', 'non-existent')).rejects.toThrow(
      NotFoundException,
    );
    expect(postRepository.delete).not.toHaveBeenCalled();
  });

  it('эрхгүй хэрэглэгчид ForbiddenException', async () => {
    postRepository.findById.mockResolvedValue(mockPost);

    /** user-2 нь user-1-ийн нийтлэлийг устгах гэж байна, ADMIN биш */
    await expect(useCase.execute('user-2', 'STUDENT', 'post-1')).rejects.toThrow(
      ForbiddenException,
    );
    expect(postRepository.delete).not.toHaveBeenCalled();
  });
});
