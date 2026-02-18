import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { UpdateCommentUseCase } from '../../application/use-cases/update-comment.use-case';
import { LessonCommentRepository } from '../../infrastructure/repositories/lesson-comment.repository';
import { DiscussionCacheService } from '../../infrastructure/services/discussion-cache.service';
import { LessonCommentEntity } from '../../domain/entities/lesson-comment.entity';

describe('UpdateCommentUseCase', () => {
  let useCase: UpdateCommentUseCase;
  let commentRepository: jest.Mocked<LessonCommentRepository>;
  let cacheService: jest.Mocked<DiscussionCacheService>;

  const now = new Date();

  /** Тест өгөгдөл: сэтгэгдэл — эзэмшигч user-id-1 */
  const mockComment = new LessonCommentEntity({
    id: 'comment-id-1',
    lessonId: 'lesson-id-1',
    userId: 'user-id-1',
    content: 'Анхны сэтгэгдэл',
    upvotes: 0,
    upvoterIds: [],
    replies: [],
    isInstructorReply: false,
    createdAt: now,
    updatedAt: now,
  });

  /** Тест өгөгдөл: шинэчлэгдсэн сэтгэгдэл */
  const mockUpdatedComment = new LessonCommentEntity({
    id: 'comment-id-1',
    lessonId: 'lesson-id-1',
    userId: 'user-id-1',
    content: 'Шинэчлэгдсэн сэтгэгдэл',
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
        UpdateCommentUseCase,
        {
          provide: LessonCommentRepository,
          useValue: {
            findById: jest.fn(),
            update: jest.fn(),
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

    useCase = module.get<UpdateCommentUseCase>(UpdateCommentUseCase);
    commentRepository = module.get(LessonCommentRepository);
    cacheService = module.get(DiscussionCacheService);
  });

  it('амжилттай сэтгэгдэл шинэчлэх', async () => {
    /** Эзэмшигч өөрийн сэтгэгдлийг шинэчлэх */
    commentRepository.findById.mockResolvedValue(mockComment);
    commentRepository.update.mockResolvedValue(mockUpdatedComment);

    const result = await useCase.execute('comment-id-1', 'user-id-1', 'STUDENT', {
      content: 'Шинэчлэгдсэн сэтгэгдэл',
    });

    expect(result).toBeDefined();
    expect(result.content).toBe('Шинэчлэгдсэн сэтгэгдэл');
    expect(commentRepository.update).toHaveBeenCalledWith('comment-id-1', {
      content: 'Шинэчлэгдсэн сэтгэгдэл',
    });
    expect(cacheService.invalidateComment).toHaveBeenCalledWith('comment-id-1');
  });

  it('сэтгэгдэл олдоогүй бол NotFoundException', async () => {
    /** Байхгүй сэтгэгдлийг шинэчлэх оролдлого */
    commentRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('nonexistent', 'user-id-1', 'STUDENT', {
        content: 'Тест',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('өөрийн бус сэтгэгдэлд ForbiddenException', async () => {
    /** Өөрийнх биш сэтгэгдлийг шинэчлэх оролдлого — STUDENT эрхтэй */
    commentRepository.findById.mockResolvedValue(mockComment);

    await expect(
      useCase.execute('comment-id-1', 'other-user-id', 'STUDENT', {
        content: 'Тест',
      }),
    ).rejects.toThrow(ForbiddenException);
  });
});
