import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { CreateSubscriptionUseCase } from '../../application/use-cases/create-subscription.use-case';
import { SubscriptionRepository } from '../../infrastructure/repositories/subscription.repository';
import { PaymentCacheService } from '../../infrastructure/services/payment-cache.service';
import { SubscriptionEntity } from '../../domain/entities/subscription.entity';

describe('CreateSubscriptionUseCase', () => {
  let useCase: CreateSubscriptionUseCase;
  let subscriptionRepository: jest.Mocked<SubscriptionRepository>;

  const now = new Date();
  const monthLater = new Date(now);
  monthLater.setMonth(monthLater.getMonth() + 1);
  const yearLater = new Date(now);
  yearLater.setFullYear(yearLater.getFullYear() + 1);

  /** Тестэд ашиглах mock бүртгэл (monthly) */
  const mockMonthlySubscription = new SubscriptionEntity({
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

  /** Тестэд ашиглах mock бүртгэл (yearly) */
  const mockYearlySubscription = new SubscriptionEntity({
    id: 'sub-2',
    userId: 'user-1',
    planType: 'yearly',
    status: 'active',
    currentPeriodStart: now,
    currentPeriodEnd: yearLater,
    externalSubscriptionId: null,
    cancelAtPeriodEnd: false,
    cancelledAt: null,
    createdAt: now,
    updatedAt: now,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateSubscriptionUseCase,
        {
          provide: SubscriptionRepository,
          useValue: {
            findActiveByUserId: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: PaymentCacheService,
          useValue: {
            invalidateSubscription: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<CreateSubscriptionUseCase>(CreateSubscriptionUseCase);
    subscriptionRepository = module.get(SubscriptionRepository);
  });

  it('идэвхтэй бүртгэл аль хэдийн байгаа үед ConflictException', async () => {
    subscriptionRepository.findActiveByUserId.mockResolvedValue(mockMonthlySubscription);

    await expect(useCase.execute('user-1', { planType: 'monthly' })).rejects.toThrow(
      ConflictException,
    );

    expect(subscriptionRepository.findActiveByUserId).toHaveBeenCalledWith('user-1');
    expect(subscriptionRepository.create).not.toHaveBeenCalled();
  });

  it('monthly бүртгэл амжилттай үүсгэх', async () => {
    subscriptionRepository.findActiveByUserId.mockResolvedValue(null);
    subscriptionRepository.create.mockResolvedValue(mockMonthlySubscription);

    const result = await useCase.execute('user-1', { planType: 'monthly' });

    expect(result).toEqual(mockMonthlySubscription);
    expect(subscriptionRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        planType: 'monthly',
        currentPeriodStart: expect.any(Date),
        currentPeriodEnd: expect.any(Date),
      }),
    );
  });

  it('yearly бүртгэл амжилттай үүсгэх', async () => {
    subscriptionRepository.findActiveByUserId.mockResolvedValue(null);
    subscriptionRepository.create.mockResolvedValue(mockYearlySubscription);

    const result = await useCase.execute('user-1', { planType: 'yearly' });

    expect(result).toEqual(mockYearlySubscription);
    expect(subscriptionRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        planType: 'yearly',
        currentPeriodStart: expect.any(Date),
        currentPeriodEnd: expect.any(Date),
      }),
    );
  });
});
