import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { DeleteCommentUseCase } from '../../application/use-cases/delete-comment.use-case';
import { LessonCommentRepository } from '../../infrastructure/repositories/lesson-comment.repository';
import { DiscussionCacheService } from '../../infrastructure/services/discussion-cache.service';
import { LessonCommentEntity } from '../../domain/entities/lesson-comment.entity';

describe('DeleteCommentUseCase', () => {
  let useCase: DeleteCommentUseCase;
  let commentRepository: jest.Mocked<LessonCommentRepository>;
  let cacheService: jest.Mocked<DiscussionCacheService>;

  const now = new Date();

  /** Тест өгөгдөл: сэтгэгдэл — эзэмшигч user-id-1 */
  const mockComment = new LessonCommentEntity({
    id: 'comment-id-1',
    lessonId: 'lesson-id-1',
    userId: 'user-id-1',
    content: 'Устгах сэтгэгдэл',
    upvotes: 0,
    upvoterIds: [],
    replies: [],
    isInstructorReply: false,
    createdAt: now,
    updatedAt: now,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteCommentUseCase,
        {
          provide: LessonCommentRepository,
          useValue: {
            findById: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: DiscussionCacheService,
          useValue: {
            invalidateComment: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<DeleteCommentUseCase>(DeleteCommentUseCase);
    commentRepository = module.get(LessonCommentRepository);
    cacheService = module.get(DiscussionCacheService);
  });

  it('амжилттай устгах', async () => {
    /** Эзэмшигч өөрийн сэтгэгдлийг амжилттай устгах */
    commentRepository.findById.mockResolvedValue(mockComment);
    commentRepository.delete.mockResolvedValue(undefined);

    await useCase.execute('comment-id-1', 'user-id-1', 'STUDENT');

    expect(commentRepository.delete).toHaveBeenCalledWith('comment-id-1');
    expect(cacheService.invalidateComment).toHaveBeenCalledWith('comment-id-1');
  });

  it('сэтгэгдэл олдоогүй бол NotFoundException', async () => {
    /** Байхгүй сэтгэгдлийг устгах оролдлого */
    commentRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('nonexistent', 'user-id-1', 'STUDENT')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('эрхгүй хэрэглэгчид ForbiddenException', async () => {
    /** Өөрийнх биш сэтгэгдлийг устгах оролдлого — STUDENT эрхтэй */
    commentRepository.findById.mockResolvedValue(mockComment);

    await expect(useCase.execute('comment-id-1', 'other-user-id', 'STUDENT')).rejects.toThrow(
      ForbiddenException,
    );
  });
});
