import { Test, TestingModule } from '@nestjs/testing';
import { GetMySubscriptionUseCase } from '../../application/use-cases/get-my-subscription.use-case';
import { PaymentCacheService } from '../../infrastructure/services/payment-cache.service';
import { SubscriptionEntity } from '../../domain/entities/subscription.entity';

describe('GetMySubscriptionUseCase', () => {
  let useCase: GetMySubscriptionUseCase;
  let paymentCacheService: jest.Mocked<PaymentCacheService>;

  const now = new Date();
  const monthLater = new Date(now);
  monthLater.setMonth(monthLater.getMonth() + 1);

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
        GetMySubscriptionUseCase,
        {
          provide: PaymentCacheService,
          useValue: {
            getActiveSubscription: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<GetMySubscriptionUseCase>(GetMySubscriptionUseCase);
    paymentCacheService = module.get(PaymentCacheService);
  });

  it('идэвхтэй бүртгэл олдоогүй бол null буцаах', async () => {
    paymentCacheService.getActiveSubscription.mockResolvedValue(null);

    const result = await useCase.execute('user-1');

    expect(result).toBeNull();
    expect(paymentCacheService.getActiveSubscription).toHaveBeenCalledWith('user-1');
  });

  it('идэвхтэй бүртгэл амжилттай авах', async () => {
    paymentCacheService.getActiveSubscription.mockResolvedValue(mockSubscription);

    const result = await useCase.execute('user-1');

    expect(result).toEqual(mockSubscription);
    expect(paymentCacheService.getActiveSubscription).toHaveBeenCalledWith('user-1');
  });
});
