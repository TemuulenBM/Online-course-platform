import { Test, TestingModule } from '@nestjs/testing';
import { LessonCommentsController } from '../../interface/controllers/lesson-comments.controller';
import { CreateCommentUseCase } from '../../application/use-cases/create-comment.use-case';
import { ListLessonCommentsUseCase } from '../../application/use-cases/list-lesson-comments.use-case';
import { UpdateCommentUseCase } from '../../application/use-cases/update-comment.use-case';
import { DeleteCommentUseCase } from '../../application/use-cases/delete-comment.use-case';
import { AddCommentReplyUseCase } from '../../application/use-cases/add-comment-reply.use-case';
import { UpvoteCommentUseCase } from '../../application/use-cases/upvote-comment.use-case';
import { LessonCommentEntity } from '../../domain/entities/lesson-comment.entity';
import { CommentReplyVO } from '../../domain/value-objects/comment-reply.vo';

describe('LessonCommentsController', () => {
  let controller: LessonCommentsController;
  let createCommentUseCase: jest.Mocked<CreateCommentUseCase>;
  let listLessonCommentsUseCase: jest.Mocked<ListLessonCommentsUseCase>;
  let updateCommentUseCase: jest.Mocked<UpdateCommentUseCase>;
  let deleteCommentUseCase: jest.Mocked<DeleteCommentUseCase>;
  let addCommentReplyUseCase: jest.Mocked<AddCommentReplyUseCase>;
  let upvoteCommentUseCase: jest.Mocked<UpvoteCommentUseCase>;

  /** Тестэд ашиглах mock хариулт */
  const mockCommentReply = new CommentReplyVO({
    replyId: 'reply-1',
    userId: 'user-2',
    content: 'Тийм ээ, энэ хэсгийг дахин тайлбарлая',
    upvotes: 2,
    upvoterIds: ['user-3'],
    createdAt: new Date('2026-02-05'),
  });

  /** Тестэд ашиглах mock сэтгэгдэл entity */
  const mockComment = new LessonCommentEntity({
    id: 'comment-1',
    lessonId: 'lesson-1',
    userId: 'user-1',
    parentCommentId: undefined,
    content: 'Энэ хэсгийг илүү дэлгэрэнгүй тайлбарлана уу',
    timestampSeconds: 120,
    upvotes: 5,
    upvoterIds: ['user-2', 'user-3'],
    replies: [mockCommentReply],
    isInstructorReply: false,
    createdAt: new Date('2026-02-01'),
    updatedAt: new Date('2026-02-03'),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LessonCommentsController],
      providers: [
        {
          provide: CreateCommentUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: ListLessonCommentsUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: UpdateCommentUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: DeleteCommentUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: AddCommentReplyUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: UpvoteCommentUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<LessonCommentsController>(LessonCommentsController);
    createCommentUseCase = module.get(CreateCommentUseCase);
    listLessonCommentsUseCase = module.get(ListLessonCommentsUseCase);
    updateCommentUseCase = module.get(UpdateCommentUseCase);
    deleteCommentUseCase = module.get(DeleteCommentUseCase);
    addCommentReplyUseCase = module.get(AddCommentReplyUseCase);
    upvoteCommentUseCase = module.get(UpvoteCommentUseCase);
  });

  // ========================================
  // Сэтгэгдэл CRUD тестүүд
  // ========================================

  it('POST /discussions/comments — сэтгэгдэл үүсгэх use case дуудагдаж toResponse(userId) буцаах', async () => {
    createCommentUseCase.execute.mockResolvedValue(mockComment);

    const dto = {
      lessonId: 'lesson-1',
      content: 'Энэ хэсгийг илүү дэлгэрэнгүй тайлбарлана уу',
      timestampSeconds: 120,
    };

    const result = await controller.createComment('user-1', 'STUDENT', dto);

    expect(result).toEqual(mockComment.toResponse('user-1'));
    expect(createCommentUseCase.execute).toHaveBeenCalledWith('user-1', 'STUDENT', dto);
  });

  it('GET /discussions/comments/lesson/:lessonId — хичээлийн сэтгэгдлүүдийн жагсаалт pagination хэлбэрээр буцаах', async () => {
    const mockResult = {
      data: [mockComment],
      total: 1,
      page: 1,
      limit: 20,
    };
    listLessonCommentsUseCase.execute.mockResolvedValue(mockResult);

    const query = {
      page: 1,
      limit: 20,
      sortBy: 'newest' as const,
    };

    const result = await controller.listLessonComments('lesson-1', 'user-1', query);

    expect(result).toEqual(mockResult);
    expect(listLessonCommentsUseCase.execute).toHaveBeenCalledWith('lesson-1', 'user-1', {
      page: 1,
      limit: 20,
      sortBy: 'newest',
    });
  });

  it('PATCH /discussions/comments/:id — сэтгэгдэл шинэчлэх use case-д id, userId, role, dto зөв дамжуулагдах', async () => {
    updateCommentUseCase.execute.mockResolvedValue(mockComment);

    const dto = {
      content: 'Шинэчилсэн сэтгэгдэл',
    };

    const result = await controller.updateComment('comment-1', 'user-1', 'STUDENT', dto);

    expect(result).toEqual(mockComment.toResponse('user-1'));
    expect(updateCommentUseCase.execute).toHaveBeenCalledWith(
      'comment-1',
      'user-1',
      'STUDENT',
      dto,
    );
  });

  it('DELETE /discussions/comments/:id — сэтгэгдэл устгах use case-д id, userId, role зөв дамжуулагдах', async () => {
    deleteCommentUseCase.execute.mockResolvedValue(undefined);

    await controller.deleteComment('comment-1', 'user-1', 'STUDENT');

    expect(deleteCommentUseCase.execute).toHaveBeenCalledWith('comment-1', 'user-1', 'STUDENT');
  });

  // ========================================
  // Хариулт + Upvote тестүүд
  // ========================================

  it('POST /discussions/comments/:id/replies — хариулт нэмэх use case-д commentId, userId, role, dto зөв дамжуулагдах', async () => {
    addCommentReplyUseCase.execute.mockResolvedValue(mockComment);

    const dto = {
      content: 'Тийм ээ, энэ хэсгийг дахин тайлбарлая',
    };

    const result = await controller.addReply('comment-1', 'user-1', 'STUDENT', dto);

    expect(result).toEqual(mockComment.toResponse('user-1'));
    expect(addCommentReplyUseCase.execute).toHaveBeenCalledWith(
      'comment-1',
      'user-1',
      'STUDENT',
      dto,
    );
  });

  it('POST /discussions/comments/:id/upvote — upvote toggle use case-д commentId, userId, role зөв дамжуулагдах', async () => {
    upvoteCommentUseCase.execute.mockResolvedValue(mockComment);

    const result = await controller.upvoteComment('comment-1', 'user-1', 'STUDENT');

    expect(result).toEqual(mockComment.toResponse('user-1'));
    expect(upvoteCommentUseCase.execute).toHaveBeenCalledWith('comment-1', 'user-1', 'STUDENT');
  });
});
