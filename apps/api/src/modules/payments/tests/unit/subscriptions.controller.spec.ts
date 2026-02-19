import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionsController } from '../../interface/controllers/subscriptions.controller';
import { CreateSubscriptionUseCase } from '../../application/use-cases/create-subscription.use-case';
import { CancelSubscriptionUseCase } from '../../application/use-cases/cancel-subscription.use-case';
import { GetMySubscriptionUseCase } from '../../application/use-cases/get-my-subscription.use-case';
import { SubscriptionEntity } from '../../domain/entities/subscription.entity';

describe('SubscriptionsController', () => {
  let controller: SubscriptionsController;
  let createSubscriptionUseCase: jest.Mocked<CreateSubscriptionUseCase>;
  let cancelSubscriptionUseCase: jest.Mocked<CancelSubscriptionUseCase>;
  let getMySubscriptionUseCase: jest.Mocked<GetMySubscriptionUseCase>;

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
      controllers: [SubscriptionsController],
      providers: [
        {
          provide: CreateSubscriptionUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: CancelSubscriptionUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: GetMySubscriptionUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<SubscriptionsController>(SubscriptionsController);
    createSubscriptionUseCase = module.get(CreateSubscriptionUseCase);
    cancelSubscriptionUseCase = module.get(CancelSubscriptionUseCase);
    getMySubscriptionUseCase = module.get(GetMySubscriptionUseCase);
  });

  it('createSubscription — use case дуудаж toResponse буцаах', async () => {
    createSubscriptionUseCase.execute.mockResolvedValue(mockSubscription);

    const result = await controller.createSubscription('user-1', {
      planType: 'monthly',
    });

    expect(createSubscriptionUseCase.execute).toHaveBeenCalledWith('user-1', {
      planType: 'monthly',
    });
    expect(result).toEqual(mockSubscription.toResponse());
  });

  it('getMySubscription — use case дуудаж toResponse буцаах', async () => {
    getMySubscriptionUseCase.execute.mockResolvedValue(mockSubscription);

    const result = await controller.getMySubscription('user-1');

    expect(getMySubscriptionUseCase.execute).toHaveBeenCalledWith('user-1');
    expect(result).toEqual(mockSubscription.toResponse());
  });

  it('getMySubscription — бүртгэл байхгүй бол null', async () => {
    getMySubscriptionUseCase.execute.mockResolvedValue(null);

    const result = await controller.getMySubscription('user-1');

    expect(result).toBeNull();
  });

  it('cancelSubscription — use case дуудаж toResponse буцаах', async () => {
    cancelSubscriptionUseCase.execute.mockResolvedValue(mockSubscription);

    const result = await controller.cancelSubscription('sub-1', 'user-1', 'STUDENT');

    expect(cancelSubscriptionUseCase.execute).toHaveBeenCalledWith('sub-1', 'user-1', 'STUDENT');
    expect(result).toEqual(mockSubscription.toResponse());
  });
});
