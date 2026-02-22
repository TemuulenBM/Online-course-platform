import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ReviewFlaggedContentUseCase } from '../../application/use-cases/review-flagged-content.use-case';
import { DiscussionPostRepository } from '../../../discussions/infrastructure/repositories/discussion-post.repository';
import { AdminCacheService } from '../../infrastructure/services/admin-cache.service';
import { AuditLogService } from '../../infrastructure/services/audit-log.service';
import { NotificationService } from '../../../notifications/application/services/notification.service';
import { DiscussionPostEntity } from '../../../discussions/domain/entities/discussion-post.entity';

describe('ReviewFlaggedContentUseCase', () => {
  let useCase: ReviewFlaggedContentUseCase;
  let postRepository: jest.Mocked<DiscussionPostRepository>;
  let cacheService: jest.Mocked<AdminCacheService>;
  let auditLogService: jest.Mocked<AuditLogService>;
  let notificationService: jest.Mocked<NotificationService>;

  const mockPost = new DiscussionPostEntity({
    id: 'post-1',
    courseId: 'course-1',
    lessonId: null,
    threadId: null,
    authorId: 'user-1',
    postType: 'discussion',
    title: 'Flagged post',
    content: 'Flagged content',
    contentHtml: '<p>Flagged</p>',
    isAnswered: false,
    acceptedAnswerId: null,
    upvotes: 0,
    downvotes: 0,
    voteScore: 0,
    replies: [],
    voters: [],
    tags: [],
    viewsCount: 0,
    isPinned: false,
    isLocked: false,
    isFlagged: true,
    flagReason: 'Spam',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewFlaggedContentUseCase,
        {
          provide: DiscussionPostRepository,
          useValue: { findById: jest.fn(), toggleFlag: jest.fn(), delete: jest.fn() },
        },
        { provide: AdminCacheService, useValue: { invalidateModeration: jest.fn() } },
        { provide: AuditLogService, useValue: { log: jest.fn() } },
        { provide: NotificationService, useValue: { send: jest.fn() } },
      ],
    }).compile();

    useCase = module.get<ReviewFlaggedContentUseCase>(ReviewFlaggedContentUseCase);
    postRepository = module.get(DiscussionPostRepository);
    cacheService = module.get(AdminCacheService);
    auditLogService = module.get(AuditLogService);
    notificationService = module.get(NotificationService);
  });

  it('олдоогүй бол NotFoundException шидэнэ', async () => {
    postRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('nonexistent', 'approve', 'admin-1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('approve — flag арилгана', async () => {
    postRepository.findById.mockResolvedValue(mockPost);

    await useCase.execute('post-1', 'approve', 'admin-1');

    expect(postRepository.toggleFlag).toHaveBeenCalledWith('post-1', false);
    expect(postRepository.delete).not.toHaveBeenCalled();
    expect(cacheService.invalidateModeration).toHaveBeenCalled();
    expect(auditLogService.log).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'APPROVE' }),
    );
  });

  it('reject — нийтлэл устгаж notification илгээнэ', async () => {
    postRepository.findById.mockResolvedValue(mockPost);

    await useCase.execute('post-1', 'reject', 'admin-1', 'Spam content');

    expect(postRepository.delete).toHaveBeenCalledWith('post-1');
    expect(notificationService.send).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({ type: 'IN_APP', title: 'Нийтлэл устгагдлаа' }),
    );
    expect(auditLogService.log).toHaveBeenCalledWith(expect.objectContaining({ action: 'REJECT' }));
  });
});
