import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { CancelSubscriptionUseCase } from '../../application/use-cases/cancel-subscription.use-case';
import { SubscriptionRepository } from '../../infrastructure/repositories/subscription.repository';
import { PaymentCacheService } from '../../infrastructure/services/payment-cache.service';
import { SubscriptionEntity } from '../../domain/entities/subscription.entity';

describe('CancelSubscriptionUseCase', () => {
  let useCase: CancelSubscriptionUseCase;
  let subscriptionRepository: jest.Mocked<SubscriptionRepository>;
  let paymentCacheService: jest.Mocked<PaymentCacheService>;

  const now = new Date();
  const monthLater = new Date(now);
  monthLater.setMonth(monthLater.getMonth() + 1);

  /** Тестэд ашиглах mock бүртгэл (active) */
  const mockActiveSubscription = new SubscriptionEntity({
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

  /** Тестэд ашиглах mock бүртгэл (cancelled) */
  const mockCancelledSubscription = new SubscriptionEntity({
    id: 'sub-2',
    userId: 'user-1',
    planType: 'monthly',
    status: 'cancelled',
    currentPeriodStart: now,
    currentPeriodEnd: monthLater,
    externalSubscriptionId: null,
    cancelAtPeriodEnd: true,
    cancelledAt: now,
    createdAt: now,
    updatedAt: now,
  });

  /** Тестэд ашиглах mock шинэчлэгдсэн бүртгэл */
  const mockUpdatedSubscription = new SubscriptionEntity({
    id: 'sub-1',
    userId: 'user-1',
    planType: 'monthly',
    status: 'active',
    currentPeriodStart: now,
    currentPeriodEnd: monthLater,
    externalSubscriptionId: null,
    cancelAtPeriodEnd: true,
    cancelledAt: now,
    createdAt: now,
    updatedAt: now,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CancelSubscriptionUseCase,
        {
          provide: SubscriptionRepository,
          useValue: {
            findById: jest.fn(),
            update: jest.fn(),
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

    useCase = module.get<CancelSubscriptionUseCase>(CancelSubscriptionUseCase);
    subscriptionRepository = module.get(SubscriptionRepository);
    paymentCacheService = module.get(PaymentCacheService);
  });

  it('бүртгэл олдоогүй үед NotFoundException', async () => {
    subscriptionRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('sub-999', 'user-1', 'STUDENT')).rejects.toThrow(
      NotFoundException,
    );

    expect(subscriptionRepository.findById).toHaveBeenCalledWith('sub-999');
    expect(subscriptionRepository.update).not.toHaveBeenCalled();
  });

  it('өөрийн биш бүртгэлийг цуцлах үед ForbiddenException', async () => {
    subscriptionRepository.findById.mockResolvedValue(mockActiveSubscription);

    await expect(useCase.execute('sub-1', 'user-other', 'STUDENT')).rejects.toThrow(
      ForbiddenException,
    );

    expect(subscriptionRepository.update).not.toHaveBeenCalled();
  });

  it('идэвхтэй биш бүртгэлийг цуцлах үед BadRequestException', async () => {
    subscriptionRepository.findById.mockResolvedValue(mockCancelledSubscription);

    await expect(useCase.execute('sub-2', 'user-1', 'STUDENT')).rejects.toThrow(
      BadRequestException,
    );

    expect(subscriptionRepository.update).not.toHaveBeenCalled();
  });

  it('амжилттай бүртгэл цуцлах + кэш invalidate', async () => {
    subscriptionRepository.findById.mockResolvedValue(mockActiveSubscription);
    subscriptionRepository.update.mockResolvedValue(mockUpdatedSubscription);
    paymentCacheService.invalidateSubscription.mockResolvedValue(undefined);

    const result = await useCase.execute('sub-1', 'user-1', 'STUDENT');

    expect(result).toEqual(mockUpdatedSubscription);
    expect(subscriptionRepository.update).toHaveBeenCalledWith(
      'sub-1',
      expect.objectContaining({
        cancelAtPeriodEnd: true,
        cancelledAt: expect.any(Date),
      }),
    );
    expect(paymentCacheService.invalidateSubscription).toHaveBeenCalledWith('sub-1', 'user-1');
  });
});
