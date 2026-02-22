import { Test, TestingModule } from '@nestjs/testing';
import { AdminCacheService } from '../../infrastructure/services/admin-cache.service';
import { RedisService } from '../../../../common/redis/redis.service';

describe('AdminCacheService', () => {
  let service: AdminCacheService;
  let redisService: jest.Mocked<RedisService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminCacheService,
        {
          provide: RedisService,
          useValue: { get: jest.fn(), set: jest.fn(), del: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<AdminCacheService>(AdminCacheService);
    redisService = module.get(RedisService);
  });

  describe('Settings кэш', () => {
    it('getSettings — кэшнээс авах', async () => {
      redisService.get.mockResolvedValue([{ key: 'test' }]);

      const result = await service.getSettings();

      expect(result).toEqual([{ key: 'test' }]);
      expect(redisService.get).toHaveBeenCalledWith('admin:settings:all');
    });

    it('getSettings — category-тэй', async () => {
      redisService.get.mockResolvedValue(null);

      await service.getSettings('payment');

      expect(redisService.get).toHaveBeenCalledWith('admin:settings:payment');
    });

    it('setSettings — кэшлэх', async () => {
      await service.setSettings([{ key: 'test' }]);

      expect(redisService.set).toHaveBeenCalledWith('admin:settings:all', [{ key: 'test' }], 900);
    });

    it('invalidateSettings — цэвэрлэх', async () => {
      await service.invalidateSettings('site.name');

      expect(redisService.del).toHaveBeenCalledWith('admin:settings:all');
      expect(redisService.del).toHaveBeenCalledWith('admin:settings:public');
      expect(redisService.del).toHaveBeenCalledWith('admin:settings:key:site.name');
    });
  });

  describe('Dashboard кэш', () => {
    it('getDashboardStats', async () => {
      redisService.get.mockResolvedValue({ users: 100 });

      const result = await service.getDashboardStats();

      expect(result).toEqual({ users: 100 });
    });

    it('setPendingItems', async () => {
      await service.setPendingItems({ pendingOrders: 5 });

      expect(redisService.set).toHaveBeenCalledWith(
        'admin:dashboard:pending',
        { pendingOrders: 5 },
        300,
      );
    });

    it('invalidateDashboard', async () => {
      await service.invalidateDashboard();

      expect(redisService.del).toHaveBeenCalledWith('admin:dashboard:stats');
      expect(redisService.del).toHaveBeenCalledWith('admin:dashboard:pending');
    });
  });

  describe('Moderation кэш', () => {
    it('getModerationStats', async () => {
      redisService.get.mockResolvedValue({ flaggedCount: 3 });

      const result = await service.getModerationStats();

      expect(result).toEqual({ flaggedCount: 3 });
    });

    it('invalidateModeration', async () => {
      await service.invalidateModeration();

      expect(redisService.del).toHaveBeenCalledWith('admin:moderation:stats');
    });
  });
});
