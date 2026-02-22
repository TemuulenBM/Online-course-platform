import { Test, TestingModule } from '@nestjs/testing';
import { AdminDashboardController } from '../../interface/controllers/admin-dashboard.controller';
import { GetSystemHealthUseCase } from '../../application/use-cases/get-system-health.use-case';
import { GetPlatformStatsUseCase } from '../../application/use-cases/get-platform-stats.use-case';
import { GetPendingItemsUseCase } from '../../application/use-cases/get-pending-items.use-case';
import { GetRecentActivityUseCase } from '../../application/use-cases/get-recent-activity.use-case';
import { GetModerationStatsUseCase } from '../../application/use-cases/get-moderation-stats.use-case';
import { ListFlaggedContentUseCase } from '../../application/use-cases/list-flagged-content.use-case';
import { ReviewFlaggedContentUseCase } from '../../application/use-cases/review-flagged-content.use-case';

describe('AdminDashboardController', () => {
  let controller: AdminDashboardController;
  let healthUseCase: jest.Mocked<GetSystemHealthUseCase>;
  let statsUseCase: jest.Mocked<GetPlatformStatsUseCase>;
  let pendingUseCase: jest.Mocked<GetPendingItemsUseCase>;
  let activityUseCase: jest.Mocked<GetRecentActivityUseCase>;
  let moderationStatsUseCase: jest.Mocked<GetModerationStatsUseCase>;
  let listFlaggedUseCase: jest.Mocked<ListFlaggedContentUseCase>;
  let reviewUseCase: jest.Mocked<ReviewFlaggedContentUseCase>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminDashboardController],
      providers: [
        { provide: GetSystemHealthUseCase, useValue: { execute: jest.fn() } },
        { provide: GetPlatformStatsUseCase, useValue: { execute: jest.fn() } },
        { provide: GetPendingItemsUseCase, useValue: { execute: jest.fn() } },
        { provide: GetRecentActivityUseCase, useValue: { execute: jest.fn() } },
        { provide: GetModerationStatsUseCase, useValue: { execute: jest.fn() } },
        { provide: ListFlaggedContentUseCase, useValue: { execute: jest.fn() } },
        { provide: ReviewFlaggedContentUseCase, useValue: { execute: jest.fn() } },
      ],
    }).compile();

    controller = module.get<AdminDashboardController>(AdminDashboardController);
    healthUseCase = module.get(GetSystemHealthUseCase);
    statsUseCase = module.get(GetPlatformStatsUseCase);
    pendingUseCase = module.get(GetPendingItemsUseCase);
    activityUseCase = module.get(GetRecentActivityUseCase);
    moderationStatsUseCase = module.get(GetModerationStatsUseCase);
    listFlaggedUseCase = module.get(ListFlaggedContentUseCase);
    reviewUseCase = module.get(ReviewFlaggedContentUseCase);
  });

  it('getHealth — системийн health', async () => {
    const mockHealth = { status: 'ok', services: {} };
    healthUseCase.execute.mockResolvedValue(mockHealth as any);

    const result = await controller.getHealth();

    expect(result).toEqual(mockHealth);
  });

  it('getStats — статистик', async () => {
    const mockStats = { users: { total: 100 } };
    statsUseCase.execute.mockResolvedValue(mockStats);

    const result = await controller.getStats();

    expect(result).toEqual(mockStats);
  });

  it('getPending — хүлээгдэж буй', async () => {
    const mockPending = { pendingOrders: 5, totalPending: 8 };
    pendingUseCase.execute.mockResolvedValue(mockPending);

    const result = await controller.getPending();

    expect(result).toEqual(mockPending);
  });

  it('getActivity — сүүлийн үйлдлүүд', async () => {
    activityUseCase.execute.mockResolvedValue([]);

    const result = await controller.getActivity(5);

    expect(result).toEqual([]);
    expect(activityUseCase.execute).toHaveBeenCalledWith(5);
  });

  it('getModerationStats — moderation статистик', async () => {
    moderationStatsUseCase.execute.mockResolvedValue({ flaggedCount: 3, lockedCount: 1 });

    const result = await controller.getModerationStats();

    expect(result).toEqual({ flaggedCount: 3, lockedCount: 1 });
  });

  it('listFlagged — flagged жагсаалт', async () => {
    const mockResult = { data: [], total: 0, page: 1, limit: 20 };
    listFlaggedUseCase.execute.mockResolvedValue(mockResult);

    const result = await controller.listFlagged({ page: 1, limit: 20 });

    expect(result).toEqual(mockResult);
  });

  it('approveFlagged — approve', async () => {
    reviewUseCase.execute.mockResolvedValue(undefined);

    const result = await controller.approveFlagged('post-1', 'admin-1');

    expect(result).toEqual({ message: 'Нийтлэл амжилттай approve хийгдлээ' });
    expect(reviewUseCase.execute).toHaveBeenCalledWith('post-1', 'approve', 'admin-1');
  });

  it('rejectFlagged — reject', async () => {
    reviewUseCase.execute.mockResolvedValue(undefined);

    const result = await controller.rejectFlagged(
      'post-1',
      { action: 'reject', reason: 'Spam' },
      'admin-1',
    );

    expect(result).toEqual({ message: 'Нийтлэл амжилттай reject хийгдлээ' });
  });
});
