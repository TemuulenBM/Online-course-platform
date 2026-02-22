import { Test, TestingModule } from '@nestjs/testing';
import { GetPendingItemsUseCase } from '../../application/use-cases/get-pending-items.use-case';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { DiscussionPostRepository } from '../../../discussions/infrastructure/repositories/discussion-post.repository';
import { AdminCacheService } from '../../infrastructure/services/admin-cache.service';

describe('GetPendingItemsUseCase', () => {
  let useCase: GetPendingItemsUseCase;
  let prisma: any;
  let postRepository: jest.Mocked<DiscussionPostRepository>;
  let cacheService: jest.Mocked<AdminCacheService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetPendingItemsUseCase,
        {
          provide: PrismaService,
          useValue: { order: { count: jest.fn().mockResolvedValue(5) } },
        },
        {
          provide: DiscussionPostRepository,
          useValue: { countFlagged: jest.fn().mockResolvedValue(3) },
        },
        {
          provide: AdminCacheService,
          useValue: { getPendingItems: jest.fn(), setPendingItems: jest.fn() },
        },
      ],
    }).compile();

    useCase = module.get<GetPendingItemsUseCase>(GetPendingItemsUseCase);
    prisma = module.get(PrismaService);
    postRepository = module.get(DiscussionPostRepository);
    cacheService = module.get(AdminCacheService);
  });

  it('кэшнээс олдвол шууд буцаана', async () => {
    const cached = { pendingOrders: 5, processingOrders: 2, flaggedPosts: 3, totalPending: 10 };
    cacheService.getPendingItems.mockResolvedValue(cached);

    const result = await useCase.execute();

    expect(result).toEqual(cached);
  });

  it('кэш хоосон бол тоолж кэшлэнэ', async () => {
    cacheService.getPendingItems.mockResolvedValue(null);

    const result = await useCase.execute();

    expect(result).toHaveProperty('pendingOrders');
    expect(result).toHaveProperty('flaggedPosts');
    expect(result).toHaveProperty('totalPending');
    expect(cacheService.setPendingItems).toHaveBeenCalled();
  });
});
