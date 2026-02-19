import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { GetOrderUseCase } from '../../application/use-cases/get-order.use-case';
import { PaymentCacheService } from '../../infrastructure/services/payment-cache.service';
import { OrderEntity } from '../../domain/entities/order.entity';

describe('GetOrderUseCase', () => {
  let useCase: GetOrderUseCase;
  let paymentCacheService: jest.Mocked<PaymentCacheService>;

  const now = new Date();

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
    courseInstructorId: 'instructor-1',
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetOrderUseCase,
        {
          provide: PaymentCacheService,
          useValue: {
            getOrder: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<GetOrderUseCase>(GetOrderUseCase);
    paymentCacheService = module.get(PaymentCacheService);
  });

  it('захиалга олдоогүй үед NotFoundException шидэх', async () => {
    paymentCacheService.getOrder.mockResolvedValue(null);

    await expect(useCase.execute('nonexistent', 'user-1', 'STUDENT')).rejects.toThrow(
      NotFoundException,
    );

    expect(paymentCacheService.getOrder).toHaveBeenCalledWith('nonexistent');
  });

  it('эрхгүй хэрэглэгчид ForbiddenException шидэх', async () => {
    paymentCacheService.getOrder.mockResolvedValue(mockOrder);

    await expect(useCase.execute('order-1', 'other-user', 'STUDENT')).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('захиалгын эзэмшигч амжилттай авах', async () => {
    paymentCacheService.getOrder.mockResolvedValue(mockOrder);

    const result = await useCase.execute('order-1', 'user-1', 'STUDENT');

    expect(result).toEqual(mockOrder);
  });

  it('сургалтын эзэмшигч (instructor) амжилттай авах', async () => {
    paymentCacheService.getOrder.mockResolvedValue(mockOrder);

    const result = await useCase.execute('order-1', 'instructor-1', 'TEACHER');

    expect(result).toEqual(mockOrder);
  });

  it('ADMIN хэрэглэгч ямар ч захиалга авах боломжтой', async () => {
    paymentCacheService.getOrder.mockResolvedValue(mockOrder);

    const result = await useCase.execute('order-1', 'random-admin', 'ADMIN');

    expect(result).toEqual(mockOrder);
  });
});
