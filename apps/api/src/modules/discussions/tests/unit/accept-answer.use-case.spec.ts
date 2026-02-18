import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { AcceptAnswerUseCase } from '../../application/use-cases/accept-answer.use-case';
import { DiscussionPostRepository } from '../../infrastructure/repositories/discussion-post.repository';
import { DiscussionCacheService } from '../../infrastructure/services/discussion-cache.service';
import { DiscussionPostEntity } from '../../domain/entities/discussion-post.entity';
import { ReplyVO } from '../../domain/value-objects/reply.vo';

describe('AcceptAnswerUseCase', () => {
  let useCase: AcceptAnswerUseCase;
  let postRepository: jest.Mocked<DiscussionPostRepository>;
  let cacheService: jest.Mocked<DiscussionCacheService>;

  const now = new Date();

  /** Тестэд ашиглах mock хариулт */
  const mockReply = new ReplyVO({
    replyId: 'reply-1',
    authorId: 'user-2',
    content: 'This is the answer',
    contentHtml: '<p>This is the answer</p>',
    upvotes: 3,
    downvotes: 0,
    isAccepted: false,
    createdAt: now,
    updatedAt: now,
  });

  /** Тестэд ашиглах mock question төрлийн нийтлэл (хариулттай) */
  const mockQuestionPost = new DiscussionPostEntity({
    id: 'post-1',
    courseId: 'course-1',
    authorId: 'user-1',
    postType: 'question',
    title: 'Test Question',
    content: 'How to do this?',
    contentHtml: '<p>How to do this?</p>',
    isAnswered: false,
    upvotes: 0,
    downvotes: 0,
    voteScore: 0,
    replies: [mockReply],
    voters: [],
    tags: [],
    viewsCount: 5,
    isPinned: false,
    isLocked: false,
    isFlagged: false,
    createdAt: now,
    updatedAt: now,
  });

  /** Тестэд ашиглах mock discussion төрлийн нийтлэл (question биш) */
  const mockDiscussionPost = new DiscussionPostEntity({
    id: 'post-2',
    courseId: 'course-1',
    authorId: 'user-1',
    postType: 'discussion',
    title: 'General Discussion',
    content: 'Let us discuss this topic',
    contentHtml: '<p>Let us discuss this topic</p>',
    isAnswered: false,
    upvotes: 0,
    downvotes: 0,
    voteScore: 0,
    replies: [mockReply],
    voters: [],
    tags: [],
    viewsCount: 0,
    isPinned: false,
    isLocked: false,
    isFlagged: false,
    createdAt: now,
    updatedAt: now,
  });

  /** Хариулт зөвшөөрөгдсөний дараах нийтлэл */
  const mockPostAfterAccept = new DiscussionPostEntity({
    id: 'post-1',
    courseId: 'course-1',
    authorId: 'user-1',
    postType: 'question',
    title: 'Test Question',
    content: 'How to do this?',
    contentHtml: '<p>How to do this?</p>',
    isAnswered: true,
    acceptedAnswerId: 'reply-1',
    upvotes: 0,
    downvotes: 0,
    voteScore: 0,
    replies: [
      new ReplyVO({
        replyId: 'reply-1',
        authorId: 'user-2',
        content: 'This is the answer',
        contentHtml: '<p>This is the answer</p>',
        upvotes: 3,
        downvotes: 0,
        isAccepted: true,
        createdAt: now,
        updatedAt: now,
      }),
    ],
    voters: [],
    tags: [],
    viewsCount: 5,
    isPinned: false,
    isLocked: false,
    isFlagged: false,
    createdAt: now,
    updatedAt: now,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AcceptAnswerUseCase,
        {
          provide: DiscussionPostRepository,
          useValue: {
            findById: jest.fn(),
            acceptAnswer: jest.fn(),
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

    useCase = module.get<AcceptAnswerUseCase>(AcceptAnswerUseCase);
    postRepository = module.get(DiscussionPostRepository);
    cacheService = module.get(DiscussionCacheService);
  });

  it('амжилттай хариулт хүлээн авах', async () => {
    postRepository.findById.mockResolvedValue(mockQuestionPost);
    postRepository.acceptAnswer.mockResolvedValue(mockPostAfterAccept);
    cacheService.invalidatePost.mockResolvedValue(undefined);

    const result = await useCase.execute('user-1', 'STUDENT', 'post-1', 'reply-1');

    expect(result).toEqual(mockPostAfterAccept);
    expect(postRepository.findById).toHaveBeenCalledWith('post-1');
    expect(postRepository.acceptAnswer).toHaveBeenCalledWith('post-1', 'reply-1');
    expect(cacheService.invalidatePost).toHaveBeenCalledWith('post-1');
  });

  it('нийтлэл олдоогүй бол NotFoundException', async () => {
    postRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('user-1', 'STUDENT', 'non-existent', 'reply-1')).rejects.toThrow(
      NotFoundException,
    );
    expect(postRepository.acceptAnswer).not.toHaveBeenCalled();
  });

  it('question төрөл биш бол BadRequestException', async () => {
    postRepository.findById.mockResolvedValue(mockDiscussionPost);

    /** discussion төрлийн нийтлэлд accepted answer тогтоох боломжгүй */
    await expect(useCase.execute('user-1', 'STUDENT', 'post-2', 'reply-1')).rejects.toThrow(
      BadRequestException,
    );
    expect(postRepository.acceptAnswer).not.toHaveBeenCalled();
  });

  it('эрхгүй хэрэглэгчид ForbiddenException', async () => {
    postRepository.findById.mockResolvedValue(mockQuestionPost);

    /** user-3 нь нийтлэлийн эзэмшигч (user-1) биш, ADMIN ч биш */
    await expect(useCase.execute('user-3', 'STUDENT', 'post-1', 'reply-1')).rejects.toThrow(
      ForbiddenException,
    );
    expect(postRepository.acceptAnswer).not.toHaveBeenCalled();
  });
});
