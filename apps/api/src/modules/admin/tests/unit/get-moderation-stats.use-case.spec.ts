import { Test, TestingModule } from '@nestjs/testing';
import { GetModerationStatsUseCase } from '../../application/use-cases/get-moderation-stats.use-case';
import { DiscussionPostRepository } from '../../../discussions/infrastructure/repositories/discussion-post.repository';
import { AdminCacheService } from '../../infrastructure/services/admin-cache.service';

describe('GetModerationStatsUseCase', () => {
  let useCase: GetModerationStatsUseCase;
  let postRepository: jest.Mocked<DiscussionPostRepository>;
  let cacheService: jest.Mocked<AdminCacheService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetModerationStatsUseCase,
        {
          provide: DiscussionPostRepository,
          useValue: { countFlagged: jest.fn(), countLocked: jest.fn() },
        },
        {
          provide: AdminCacheService,
          useValue: { getModerationStats: jest.fn(), setModerationStats: jest.fn() },
        },
      ],
    }).compile();

    useCase = module.get<GetModerationStatsUseCase>(GetModerationStatsUseCase);
    postRepository = module.get(DiscussionPostRepository);
    cacheService = module.get(AdminCacheService);
  });

  it('кэшнээс олдвол шууд буцаана', async () => {
    cacheService.getModerationStats.mockResolvedValue({ flaggedCount: 5, lockedCount: 3 });

    const result = await useCase.execute();

    expect(result).toEqual({ flaggedCount: 5, lockedCount: 3 });
    expect(postRepository.countFlagged).not.toHaveBeenCalled();
  });

  it('кэш хоосон бол DB-ээс тоолж кэшлэнэ', async () => {
    cacheService.getModerationStats.mockResolvedValue(null);
    postRepository.countFlagged.mockResolvedValue(2);
    postRepository.countLocked.mockResolvedValue(1);

    const result = await useCase.execute();

    expect(result).toEqual({ flaggedCount: 2, lockedCount: 1 });
    expect(cacheService.setModerationStats).toHaveBeenCalled();
  });
});
