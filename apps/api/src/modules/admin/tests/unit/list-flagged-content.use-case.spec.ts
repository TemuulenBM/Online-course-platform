import { Test, TestingModule } from '@nestjs/testing';
import { ListFlaggedContentUseCase } from '../../application/use-cases/list-flagged-content.use-case';
import { DiscussionPostRepository } from '../../../discussions/infrastructure/repositories/discussion-post.repository';
import { DiscussionPostEntity } from '../../../discussions/domain/entities/discussion-post.entity';

describe('ListFlaggedContentUseCase', () => {
  let useCase: ListFlaggedContentUseCase;
  let postRepository: jest.Mocked<DiscussionPostRepository>;

  const mockPost = new DiscussionPostEntity({
    id: 'post-1',
    courseId: 'course-1',
    lessonId: null,
    threadId: null,
    authorId: 'user-1',
    postType: 'discussion',
    title: 'Test post',
    content: 'This is some flagged content that should be reviewed',
    contentHtml: '<p>This is some flagged content</p>',
    isAnswered: false,
    acceptedAnswerId: null,
    upvotes: 0,
    downvotes: 0,
    voteScore: 0,
    replies: [],
    voters: [],
    tags: [],
    viewsCount: 5,
    isPinned: false,
    isLocked: false,
    isFlagged: true,
    flagReason: 'Зөрчил',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListFlaggedContentUseCase,
        {
          provide: DiscussionPostRepository,
          useValue: { findFlagged: jest.fn() },
        },
      ],
    }).compile();

    useCase = module.get<ListFlaggedContentUseCase>(ListFlaggedContentUseCase);
    postRepository = module.get(DiscussionPostRepository);
  });

  it('тэмдэглэгдсэн контентийн жагсаалт буцаана', async () => {
    postRepository.findFlagged.mockResolvedValue({
      data: [mockPost],
      total: 1,
      page: 1,
      limit: 20,
    });

    const result = await useCase.execute({ page: 1, limit: 20 });

    expect(result.data).toHaveLength(1);
    expect(result.data[0].isFlagged).toBe(true);
    expect(result.total).toBe(1);
  });

  it('хоосон жагсаалт буцааж болно', async () => {
    postRepository.findFlagged.mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 });

    const result = await useCase.execute({ page: 1, limit: 20 });

    expect(result.data).toHaveLength(0);
  });

  it('courseId filter дамжуулна', async () => {
    postRepository.findFlagged.mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 });

    await useCase.execute({ page: 1, limit: 20, courseId: 'course-1' });

    expect(postRepository.findFlagged).toHaveBeenCalledWith(1, 20, 'course-1');
  });
});
