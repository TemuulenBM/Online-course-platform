import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { getQueueToken } from '@nestjs/bull';
import { ApproveOrderUseCase } from '../../application/use-cases/approve-order.use-case';
import { OrderRepository } from '../../infrastructure/repositories/order.repository';
import { PaymentCacheService } from '../../infrastructure/services/payment-cache.service';
import { OrderEntity } from '../../domain/entities/order.entity';

describe('ApproveOrderUseCase', () => {
  let useCase: ApproveOrderUseCase;
  let orderRepository: jest.Mocked<OrderRepository>;
  let paymentCacheService: jest.Mocked<PaymentCacheService>;
  let queue: { add: jest.Mock };

  const now = new Date();

  /** Тестэд ашиглах mock захиалга — PROCESSING (баримт upload хийсэн) */
  const mockProcessingOrder = new OrderEntity({
    id: 'order-1',
    userId: 'user-1',
    courseId: 'course-1',
    amount: 50000,
    currency: 'MNT',
    status: 'processing',
    paymentMethod: 'bank_transfer',
    externalPaymentId: null,
    proofImageUrl: '/uploads/payments/order-1/proof.png',
    adminNote: null,
    metadata: null,
    paidAt: null,
    createdAt: now,
    updatedAt: now,
  });

  /** Тестэд ашиглах mock захиалга — PAID (аль хэдийн баталгаажсан) */
  const mockPaidOrder = new OrderEntity({
    ...mockProcessingOrder,
    status: 'paid',
    paidAt: now,
  });

  /** Тестэд ашиглах mock захиалга — баталгаажуулсны дараа */
  const mockApprovedOrder = new OrderEntity({
    ...mockProcessingOrder,
    status: 'paid',
    paidAt: now,
    adminNote: 'Баримт зөв байна',
  });

  beforeEach(async () => {
    queue = { add: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApproveOrderUseCase,
        {
          provide: OrderRepository,
          useValue: {
            findById: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: PaymentCacheService,
          useValue: {
            invalidateOrder: jest.fn(),
          },
        },
        {
          provide: getQueueToken('payments'),
          useValue: queue,
        },
      ],
    }).compile();

    useCase = module.get<ApproveOrderUseCase>(ApproveOrderUseCase);
    orderRepository = module.get(OrderRepository);
    paymentCacheService = module.get(PaymentCacheService);
  });

  it('захиалга олдоогүй үед NotFoundException шидэх', async () => {
    orderRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('nonexistent', { adminNote: 'OK' })).rejects.toThrow(
      NotFoundException,
    );

    expect(orderRepository.findById).toHaveBeenCalledWith('nonexistent');
  });

  it('PENDING/PROCESSING биш статустай захиалгад BadRequestException шидэх', async () => {
    orderRepository.findById.mockResolvedValue(mockPaidOrder);

    await expect(useCase.execute('order-1', { adminNote: 'OK' })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('амжилттай захиалга баталгаажуулж Bull queue-д job нэмэх', async () => {
    orderRepository.findById.mockResolvedValue(mockProcessingOrder);
    orderRepository.update.mockResolvedValue(mockApprovedOrder);

    const result = await useCase.execute('order-1', {
      adminNote: 'Баримт зөв байна',
    });

    expect(result).toEqual(mockApprovedOrder);
    expect(orderRepository.update).toHaveBeenCalledWith(
      'order-1',
      expect.objectContaining({
        status: 'paid',
        paidAt: expect.any(Date),
        adminNote: 'Баримт зөв байна',
      }),
    );
    expect(queue.add).toHaveBeenCalledWith('payment-approved', {
      orderId: 'order-1',
    });
    expect(paymentCacheService.invalidateOrder).toHaveBeenCalledWith('order-1');
  });

  it('PENDING статустай захиалгыг мөн баталгаажуулах боломжтой', async () => {
    const pendingOrder = new OrderEntity({
      ...mockProcessingOrder,
      status: 'pending',
    });
    orderRepository.findById.mockResolvedValue(pendingOrder);
    orderRepository.update.mockResolvedValue(mockApprovedOrder);

    const result = await useCase.execute('order-1', {});

    expect(result).toEqual(mockApprovedOrder);
    expect(queue.add).toHaveBeenCalledWith('payment-approved', {
      orderId: 'order-1',
    });
  });
});
