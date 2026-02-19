import { Test, TestingModule } from '@nestjs/testing';
import { PaymentCacheService } from '../../infrastructure/services/payment-cache.service';
import { RedisService } from '../../../../common/redis/redis.service';
import { OrderRepository } from '../../infrastructure/repositories/order.repository';
import { SubscriptionRepository } from '../../infrastructure/repositories/subscription.repository';
import { OrderEntity } from '../../domain/entities/order.entity';
import { SubscriptionEntity } from '../../domain/entities/subscription.entity';

describe('PaymentCacheService', () => {
  let service: PaymentCacheService;
  let redisService: jest.Mocked<RedisService>;
  let orderRepository: jest.Mocked<OrderRepository>;
  let subscriptionRepository: jest.Mocked<SubscriptionRepository>;

  const now = new Date();
  const monthLater = new Date(now);
  monthLater.setMonth(monthLater.getMonth() + 1);

  /** Тестэд ашиглах mock захиалга */
  const mockOrder = new OrderEntity({
    id: 'order-1',
    userId: 'user-1',
    courseId: 'course-1',
    amount: 50000,
    currency: 'MNT',
    status: 'pending',
    paymentMethod: 'bank_transfer',
    externalPaymentId: null,
    proofImageUrl: null,
    adminNote: null,
    metadata: null,
    paidAt: null,
    createdAt: now,
    updatedAt: now,
    userName: 'John Doe',
    userEmail: 'john@example.com',
    courseTitle: 'Test Course',
  });

  /** Тестэд ашиглах mock бүртгэл */
  const mockSubscription = new SubscriptionEntity({
    id: 'sub-1',
    userId: 'user-1',
    planType: 'monthly',
    status: 'active',
    currentPeriodStart: now,
    currentPeriodEnd: monthLater,
    externalSubscriptionId: null,
    cancelAtPeriodEnd: false,
    cancelledAt: null,
    createdAt: now,
    updatedAt: now,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentCacheService,
        {
          provide: RedisService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          },
        },
        {
          provide: OrderRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: SubscriptionRepository,
          useValue: {
            findById: jest.fn(),
            findActiveByUserId: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PaymentCacheService>(PaymentCacheService);
    redisService = module.get(RedisService);
    orderRepository = module.get(OrderRepository);
    subscriptionRepository = module.get(SubscriptionRepository);
  });

  describe('getOrder', () => {
    it('кэшнээс захиалга олдвол DB дуудахгүй (cache hit)', async () => {
      redisService.get.mockResolvedValue(mockOrder.toResponse());

      const result = await service.getOrder('order-1');

      expect(result).toBeDefined();
      expect(result!.id).toBe('order-1');
      expect(redisService.get).toHaveBeenCalledWith('order:order-1');
      expect(orderRepository.findById).not.toHaveBeenCalled();
    });

    it('кэшнээс олдоогүй бол DB-ээс авч кэшлэх (cache miss)', async () => {
      redisService.get.mockResolvedValue(null);
      orderRepository.findById.mockResolvedValue(mockOrder);

      const result = await service.getOrder('order-1');

      expect(result).toEqual(mockOrder);
      expect(orderRepository.findById).toHaveBeenCalledWith('order-1');
      expect(redisService.set).toHaveBeenCalledWith('order:order-1', mockOrder.toResponse(), 900);
    });

    it('кэш болон DB-д олдоогүй бол null буцаах', async () => {
      redisService.get.mockResolvedValue(null);
      orderRepository.findById.mockResolvedValue(null);

      const result = await service.getOrder('order-999');

      expect(result).toBeNull();
      expect(redisService.set).not.toHaveBeenCalled();
    });
  });

  describe('getActiveSubscription', () => {
    it('кэшнээс бүртгэл олдвол DB дуудахгүй (cache hit)', async () => {
      redisService.get.mockResolvedValue(mockSubscription.toResponse());

      const result = await service.getActiveSubscription('user-1');

      expect(result).toBeDefined();
      expect(result!.id).toBe('sub-1');
      expect(redisService.get).toHaveBeenCalledWith('subscription:user:user-1');
      expect(subscriptionRepository.findActiveByUserId).not.toHaveBeenCalled();
    });

    it('кэшнээс олдоогүй бол DB-ээс авч кэшлэх (cache miss)', async () => {
      redisService.get.mockResolvedValue(null);
      subscriptionRepository.findActiveByUserId.mockResolvedValue(mockSubscription);

      const result = await service.getActiveSubscription('user-1');

      expect(result).toEqual(mockSubscription);
      expect(subscriptionRepository.findActiveByUserId).toHaveBeenCalledWith('user-1');
      expect(redisService.set).toHaveBeenCalledWith(
        'subscription:user:user-1',
        mockSubscription.toResponse(),
        900,
      );
    });
  });

  describe('invalidateOrder', () => {
    it('захиалгын кэш устгах', async () => {
      await service.invalidateOrder('order-1');

      expect(redisService.del).toHaveBeenCalledWith('order:order-1');
    });
  });

  describe('invalidateSubscription', () => {
    it('бүртгэлийн болон user кэш хоёуланг устгах', async () => {
      await service.invalidateSubscription('sub-1', 'user-1');

      expect(redisService.del).toHaveBeenCalledWith('subscription:sub-1');
      expect(redisService.del).toHaveBeenCalledWith('subscription:user:user-1');
    });
  });
});
