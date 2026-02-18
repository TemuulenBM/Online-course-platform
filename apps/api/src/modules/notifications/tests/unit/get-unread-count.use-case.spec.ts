import { Test, TestingModule } from '@nestjs/testing';
import { GetUnreadCountUseCase } from '../../application/use-cases/get-unread-count.use-case';
import { NotificationCacheService } from '../../infrastructure/services/notification-cache.service';

describe('GetUnreadCountUseCase', () => {
  let useCase: GetUnreadCountUseCase;
  let cacheService: jest.Mocked<NotificationCacheService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUnreadCountUseCase,
        {
          provide: NotificationCacheService,
          useValue: {
            getUnreadCount: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<GetUnreadCountUseCase>(GetUnreadCountUseCase);
    cacheService = module.get(NotificationCacheService);
  });

  it('уншаагүй тоо буцаах', async () => {
    /** CacheService-ээс уншаагүй тоо аваад { count } хэлбэрээр буцаах */
    cacheService.getUnreadCount.mockResolvedValue(5);

    const result = await useCase.execute('user-1');

    expect(result).toEqual({ count: 5 });
    expect(cacheService.getUnreadCount).toHaveBeenCalledWith('user-1');
  });
});
