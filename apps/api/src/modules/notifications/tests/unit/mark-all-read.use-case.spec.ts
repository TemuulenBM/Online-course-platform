import { Test, TestingModule } from '@nestjs/testing';
import { MarkAllReadUseCase } from '../../application/use-cases/mark-all-read.use-case';
import { NotificationRepository } from '../../infrastructure/repositories/notification.repository';
import { NotificationCacheService } from '../../infrastructure/services/notification-cache.service';

describe('MarkAllReadUseCase', () => {
  let useCase: MarkAllReadUseCase;
  let notificationRepository: jest.Mocked<NotificationRepository>;
  let cacheService: jest.Mocked<NotificationCacheService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MarkAllReadUseCase,
        {
          provide: NotificationRepository,
          useValue: {
            markAllAsRead: jest.fn(),
          },
        },
        {
          provide: NotificationCacheService,
          useValue: {
            invalidateUnreadCount: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<MarkAllReadUseCase>(MarkAllReadUseCase);
    notificationRepository = module.get(NotificationRepository);
    cacheService = module.get(NotificationCacheService);
  });

  it('бүх уншаагүй мэдэгдлийг уншсан болгох', async () => {
    /** Repository-д бүх уншаагүй мэдэгдлийг уншсан болгож, тоог буцаах */
    notificationRepository.markAllAsRead.mockResolvedValue(3);

    const result = await useCase.execute('user-1');

    expect(result).toEqual({ count: 3 });
    expect(notificationRepository.markAllAsRead).toHaveBeenCalledWith('user-1');
  });

  it('уншаагүй тооны кэш invalidate хийх', async () => {
    /** markAllAsRead дуудсаны дараа unread count кэш invalidate хийгдэх */
    notificationRepository.markAllAsRead.mockResolvedValue(5);
    cacheService.invalidateUnreadCount.mockResolvedValue(undefined);

    await useCase.execute('user-1');

    expect(cacheService.invalidateUnreadCount).toHaveBeenCalledWith('user-1');
  });
});
