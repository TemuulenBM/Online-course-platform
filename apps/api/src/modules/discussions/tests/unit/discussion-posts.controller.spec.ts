import { Test, TestingModule } from '@nestjs/testing';
import { DiscussionPostsController } from '../../interface/controllers/discussion-posts.controller';
import { CreatePostUseCase } from '../../application/use-cases/create-post.use-case';
import { ListCoursePostsUseCase } from '../../application/use-cases/list-course-posts.use-case';
import { GetPostUseCase } from '../../application/use-cases/get-post.use-case';
import { UpdatePostUseCase } from '../../application/use-cases/update-post.use-case';
import { DeletePostUseCase } from '../../application/use-cases/delete-post.use-case';
import { AddReplyUseCase } from '../../application/use-cases/add-reply.use-case';
import { UpdateReplyUseCase } from '../../application/use-cases/update-reply.use-case';
import { DeleteReplyUseCase } from '../../application/use-cases/delete-reply.use-case';
import { VotePostUseCase } from '../../application/use-cases/vote-post.use-case';
import { AcceptAnswerUseCase } from '../../application/use-cases/accept-answer.use-case';
import { PinPostUseCase } from '../../application/use-cases/pin-post.use-case';
import { LockPostUseCase } from '../../application/use-cases/lock-post.use-case';
import { FlagPostUseCase } from '../../application/use-cases/flag-post.use-case';
import { DiscussionPostEntity } from '../../domain/entities/discussion-post.entity';
import { ReplyVO } from '../../domain/value-objects/reply.vo';
import { VoterVO } from '../../domain/value-objects/voter.vo';

describe('DiscussionPostsController', () => {
  let controller: DiscussionPostsController;
  let createPostUseCase: jest.Mocked<CreatePostUseCase>;
  let listCoursePostsUseCase: jest.Mocked<ListCoursePostsUseCase>;
  let getPostUseCase: jest.Mocked<GetPostUseCase>;
  let updatePostUseCase: jest.Mocked<UpdatePostUseCase>;
  let deletePostUseCase: jest.Mocked<DeletePostUseCase>;
  let addReplyUseCase: jest.Mocked<AddReplyUseCase>;
  let updateReplyUseCase: jest.Mocked<UpdateReplyUseCase>;
  let deleteReplyUseCase: jest.Mocked<DeleteReplyUseCase>;
  let votePostUseCase: jest.Mocked<VotePostUseCase>;
  let acceptAnswerUseCase: jest.Mocked<AcceptAnswerUseCase>;
  let pinPostUseCase: jest.Mocked<PinPostUseCase>;
  let lockPostUseCase: jest.Mocked<LockPostUseCase>;
  let flagPostUseCase: jest.Mocked<FlagPostUseCase>;

  /** Тестэд ашиглах mock хариулт */
  const mockReply = new ReplyVO({
    replyId: 'reply-1',
    authorId: 'user-2',
    content: 'Хариултын агуулга',
    contentHtml: '<p>Хариултын агуулга</p>',
    upvotes: 3,
    downvotes: 0,
    isAccepted: false,
    createdAt: new Date('2026-02-01'),
    updatedAt: new Date('2026-02-01'),
  });

  /** Тестэд ашиглах mock санал өгөгч */
  const mockVoter = new VoterVO({
    userId: 'user-1',
    voteType: 'up',
  });

  /** Тестэд ашиглах mock нийтлэл entity */
  const mockPost = new DiscussionPostEntity({
    id: 'post-1',
    courseId: 'course-1',
    lessonId: 'lesson-1',
    threadId: undefined,
    authorId: 'user-1',
    postType: 'question',
    title: 'React hooks хэрхэн ажилладаг вэ?',
    content: 'useEffect hook-ийн тухай тайлбарлана уу',
    contentHtml: '<p>useEffect hook-ийн тухай тайлбарлана уу</p>',
    isAnswered: false,
    acceptedAnswerId: undefined,
    upvotes: 5,
    downvotes: 1,
    voteScore: 4,
    replies: [mockReply],
    voters: [mockVoter],
    tags: ['react', 'hooks'],
    viewsCount: 42,
    isPinned: false,
    isLocked: false,
    isFlagged: false,
    flagReason: undefined,
    createdAt: new Date('2026-01-15'),
    updatedAt: new Date('2026-01-20'),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiscussionPostsController],
      providers: [
        {
          provide: CreatePostUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: ListCoursePostsUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: GetPostUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: UpdatePostUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: DeletePostUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: AddReplyUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: UpdateReplyUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: DeleteReplyUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: VotePostUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: AcceptAnswerUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: PinPostUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: LockPostUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: FlagPostUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<DiscussionPostsController>(DiscussionPostsController);
    createPostUseCase = module.get(CreatePostUseCase);
    listCoursePostsUseCase = module.get(ListCoursePostsUseCase);
    getPostUseCase = module.get(GetPostUseCase);
    updatePostUseCase = module.get(UpdatePostUseCase);
    deletePostUseCase = module.get(DeletePostUseCase);
    addReplyUseCase = module.get(AddReplyUseCase);
    updateReplyUseCase = module.get(UpdateReplyUseCase);
    deleteReplyUseCase = module.get(DeleteReplyUseCase);
    votePostUseCase = module.get(VotePostUseCase);
    acceptAnswerUseCase = module.get(AcceptAnswerUseCase);
    pinPostUseCase = module.get(PinPostUseCase);
    lockPostUseCase = module.get(LockPostUseCase);
    flagPostUseCase = module.get(FlagPostUseCase);
  });

  // ========================================
  // Нийтлэл CRUD тестүүд
  // ========================================

  it('POST /discussions/posts — нийтлэл үүсгэх use case дуудагдаж toResponse(userId) буцаах', async () => {
    createPostUseCase.execute.mockResolvedValue(mockPost);

    const dto = {
      courseId: 'course-1',
      postType: 'question',
      title: 'React hooks хэрхэн ажилладаг вэ?',
      content: 'useEffect hook-ийн тухай тайлбарлана уу',
      contentHtml: '<p>useEffect hook-ийн тухай тайлбарлана уу</p>',
      tags: ['react', 'hooks'],
    };

    const result = await controller.createPost('user-1', 'STUDENT', dto);

    expect(result).toEqual(mockPost.toResponse('user-1'));
    expect(createPostUseCase.execute).toHaveBeenCalledWith('user-1', 'STUDENT', dto);
  });

  it('GET /discussions/posts/course/:courseId — сургалтын нийтлэлүүдийн жагсаалт pagination хэлбэрээр буцаах', async () => {
    const mockResult = {
      data: [mockPost],
      total: 1,
      page: 1,
      limit: 20,
    };
    listCoursePostsUseCase.execute.mockResolvedValue(mockResult);

    const query = {
      page: 1,
      limit: 20,
      postType: undefined,
      search: undefined,
      tags: undefined,
      sortBy: 'newest' as const,
    };

    const result = await controller.listCoursePosts('course-1', 'user-1', query);

    expect(result).toEqual(mockResult);
    expect(listCoursePostsUseCase.execute).toHaveBeenCalledWith('course-1', 'user-1', {
      page: 1,
      limit: 20,
      postType: undefined,
      search: undefined,
      tags: undefined,
      sortBy: 'newest',
    });
  });

  it('GET /discussions/posts/:id — нийтлэлийн дэлгэрэнгүй use case дуудагдаж toResponse(userId) буцаах', async () => {
    getPostUseCase.execute.mockResolvedValue(mockPost);

    const result = await controller.getPost('post-1', 'user-1');

    expect(result).toEqual(mockPost.toResponse('user-1'));
    expect(getPostUseCase.execute).toHaveBeenCalledWith('post-1');
  });

  it('PATCH /discussions/posts/:id — нийтлэл шинэчлэх use case-д id, userId, role, dto зөв дамжуулагдах', async () => {
    updatePostUseCase.execute.mockResolvedValue(mockPost);

    const dto = {
      title: 'Шинэчилсэн гарчиг',
      content: 'Шинэчилсэн агуулга',
      contentHtml: '<p>Шинэчилсэн агуулга</p>',
    };

    const result = await controller.updatePost('post-1', 'user-1', 'STUDENT', dto);

    expect(result).toEqual(mockPost.toResponse('user-1'));
    expect(updatePostUseCase.execute).toHaveBeenCalledWith('user-1', 'STUDENT', 'post-1', dto);
  });

  it('DELETE /discussions/posts/:id — нийтлэл устгах use case-д id, userId, role зөв дамжуулагдах', async () => {
    deletePostUseCase.execute.mockResolvedValue(undefined);

    await controller.deletePost('post-1', 'user-1', 'STUDENT');

    expect(deletePostUseCase.execute).toHaveBeenCalledWith('user-1', 'STUDENT', 'post-1');
  });

  // ========================================
  // Хариулт удирдлагын тестүүд
  // ========================================

  it('POST /discussions/posts/:id/replies — хариулт нэмэх use case-д userId, role, postId, dto зөв дамжуулагдах', async () => {
    addReplyUseCase.execute.mockResolvedValue(mockPost);

    const dto = {
      content: 'Хариултын агуулга',
      contentHtml: '<p>Хариултын агуулга</p>',
    };

    const result = await controller.addReply('post-1', 'user-1', 'STUDENT', dto);

    expect(result).toEqual(mockPost.toResponse('user-1'));
    expect(addReplyUseCase.execute).toHaveBeenCalledWith('user-1', 'STUDENT', 'post-1', dto);
  });

  it('PATCH /discussions/posts/:id/replies/:replyId — хариулт шинэчлэх use case-д бүх параметр зөв дамжуулагдах', async () => {
    updateReplyUseCase.execute.mockResolvedValue(mockPost);

    const dto = {
      content: 'Шинэчилсэн хариулт',
      contentHtml: '<p>Шинэчилсэн хариулт</p>',
    };

    const result = await controller.updateReply('post-1', 'reply-1', 'user-1', 'STUDENT', dto);

    expect(result).toEqual(mockPost.toResponse('user-1'));
    expect(updateReplyUseCase.execute).toHaveBeenCalledWith(
      'user-1',
      'STUDENT',
      'post-1',
      'reply-1',
      dto,
    );
  });

  it('DELETE /discussions/posts/:id/replies/:replyId — хариулт устгах use case-д бүх параметр зөв дамжуулагдах', async () => {
    deleteReplyUseCase.execute.mockResolvedValue(undefined);

    await controller.deleteReply('post-1', 'reply-1', 'user-1', 'STUDENT');

    expect(deleteReplyUseCase.execute).toHaveBeenCalledWith(
      'user-1',
      'STUDENT',
      'post-1',
      'reply-1',
    );
  });

  // ========================================
  // Санал өгөх + хүлээн авах тестүүд
  // ========================================

  it('POST /discussions/posts/:id/vote — санал өгөх use case-д userId, role, postId, voteType зөв дамжуулагдах', async () => {
    votePostUseCase.execute.mockResolvedValue(mockPost);

    const dto = { voteType: 'up' };

    const result = await controller.votePost('post-1', 'user-1', 'STUDENT', dto);

    expect(result).toEqual(mockPost.toResponse('user-1'));
    expect(votePostUseCase.execute).toHaveBeenCalledWith('user-1', 'STUDENT', 'post-1', 'up');
  });

  it('POST /discussions/posts/:id/accept/:replyId — хариулт хүлээн авах use case-д postId, replyId, userId, role зөв дамжуулагдах', async () => {
    acceptAnswerUseCase.execute.mockResolvedValue(mockPost);

    const result = await controller.acceptAnswer('post-1', 'reply-1', 'user-1', 'STUDENT');

    expect(result).toEqual(mockPost.toResponse('user-1'));
    expect(acceptAnswerUseCase.execute).toHaveBeenCalledWith(
      'user-1',
      'STUDENT',
      'post-1',
      'reply-1',
    );
  });

  // ========================================
  // Модератор үйлдлийн тестүүд (TEACHER/ADMIN)
  // ========================================

  it('POST /discussions/posts/:id/pin — нийтлэл pin хийх use case-д userId, role, postId зөв дамжуулагдаж toResponse() буцаах', async () => {
    pinPostUseCase.execute.mockResolvedValue(mockPost);

    const result = await controller.pinPost('post-1', 'user-1', 'TEACHER');

    expect(result).toEqual(mockPost.toResponse());
    expect(pinPostUseCase.execute).toHaveBeenCalledWith('user-1', 'TEACHER', 'post-1');
  });

  it('POST /discussions/posts/:id/lock — нийтлэл lock хийх use case-д userId, role, postId зөв дамжуулагдаж toResponse() буцаах', async () => {
    lockPostUseCase.execute.mockResolvedValue(mockPost);

    const result = await controller.lockPost('post-1', 'user-1', 'TEACHER');

    expect(result).toEqual(mockPost.toResponse());
    expect(lockPostUseCase.execute).toHaveBeenCalledWith('user-1', 'TEACHER', 'post-1');
  });

  it('POST /discussions/posts/:id/flag — нийтлэл flag хийх use case-д userId, role, postId, flagReason зөв дамжуулагдаж toResponse() буцаах', async () => {
    flagPostUseCase.execute.mockResolvedValue(mockPost);

    const dto = {
      isFlagged: true,
      flagReason: 'Зохисгүй агуулга',
    };

    const result = await controller.flagPost('post-1', 'user-1', 'TEACHER', dto);

    expect(result).toEqual(mockPost.toResponse());
    expect(flagPostUseCase.execute).toHaveBeenCalledWith(
      'user-1',
      'TEACHER',
      'post-1',
      'Зохисгүй агуулга',
    );
  });
});
