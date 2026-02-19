import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { getQueueToken } from '@nestjs/bull';
import { RejectOrderUseCase } from '../../application/use-cases/reject-order.use-case';
import { OrderRepository } from '../../infrastructure/repositories/order.repository';
import { PaymentCacheService } from '../../infrastructure/services/payment-cache.service';
import { OrderEntity } from '../../domain/entities/order.entity';

describe('RejectOrderUseCase', () => {
  let useCase: RejectOrderUseCase;
  let orderRepository: jest.Mocked<OrderRepository>;
  let paymentCacheService: jest.Mocked<PaymentCacheService>;
  let queue: { add: jest.Mock };

  const now = new Date();

  /** Тестэд ашиглах mock захиалга — PROCESSING */
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

  /** Тестэд ашиглах mock захиалга — PAID (татгалзах боломжгүй) */
  const mockPaidOrder = new OrderEntity({
    ...mockProcessingOrder,
    status: 'paid',
    paidAt: now,
  });

  /** Тестэд ашиглах mock захиалга — татгалзсаны дараа */
  const mockRejectedOrder = new OrderEntity({
    ...mockProcessingOrder,
    status: 'failed',
    adminNote: 'Баримт тодорхойгүй',
  });

  beforeEach(async () => {
    queue = { add: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RejectOrderUseCase,
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

    useCase = module.get<RejectOrderUseCase>(RejectOrderUseCase);
    orderRepository = module.get(OrderRepository);
    paymentCacheService = module.get(PaymentCacheService);
  });

  it('захиалга олдоогүй үед NotFoundException шидэх', async () => {
    orderRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('nonexistent', { adminNote: 'Шалтгаан' })).rejects.toThrow(
      NotFoundException,
    );

    expect(orderRepository.findById).toHaveBeenCalledWith('nonexistent');
  });

  it('PENDING/PROCESSING биш статустай захиалгад BadRequestException шидэх', async () => {
    orderRepository.findById.mockResolvedValue(mockPaidOrder);

    await expect(useCase.execute('order-1', { adminNote: 'Шалтгаан' })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('амжилттай захиалга татгалзаж Bull queue-д job нэмэх', async () => {
    orderRepository.findById.mockResolvedValue(mockProcessingOrder);
    orderRepository.update.mockResolvedValue(mockRejectedOrder);

    const result = await useCase.execute('order-1', {
      adminNote: 'Баримт тодорхойгүй',
    });

    expect(result).toEqual(mockRejectedOrder);
    expect(orderRepository.update).toHaveBeenCalledWith('order-1', {
      status: 'failed',
      adminNote: 'Баримт тодорхойгүй',
    });
    expect(queue.add).toHaveBeenCalledWith('payment-rejected', {
      orderId: 'order-1',
    });
    expect(paymentCacheService.invalidateOrder).toHaveBeenCalledWith('order-1');
  });

  it('PENDING статустай захиалгыг мөн татгалзах боломжтой', async () => {
    const pendingOrder = new OrderEntity({
      ...mockProcessingOrder,
      status: 'pending',
    });
    orderRepository.findById.mockResolvedValue(pendingOrder);
    orderRepository.update.mockResolvedValue(mockRejectedOrder);

    const result = await useCase.execute('order-1', {
      adminNote: 'Хүчингүй болголоо',
    });

    expect(result).toEqual(mockRejectedOrder);
    expect(queue.add).toHaveBeenCalledWith('payment-rejected', {
      orderId: 'order-1',
    });
  });
});
