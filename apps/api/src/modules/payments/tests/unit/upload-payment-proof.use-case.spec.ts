import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { UploadPaymentProofUseCase } from '../../application/use-cases/upload-payment-proof.use-case';
import { OrderRepository } from '../../infrastructure/repositories/order.repository';
import { PaymentCacheService } from '../../infrastructure/services/payment-cache.service';
import { STORAGE_SERVICE } from '../../../content/infrastructure/services/storage/storage.interface';
import { OrderEntity } from '../../domain/entities/order.entity';

describe('UploadPaymentProofUseCase', () => {
  let useCase: UploadPaymentProofUseCase;
  let orderRepository: jest.Mocked<OrderRepository>;
  let paymentCacheService: jest.Mocked<PaymentCacheService>;
  let storageService: { upload: jest.Mock; delete: jest.Mock };

  const now = new Date();

  /** Тестэд ашиглах mock захиалга — PENDING */
  const mockPendingOrder = new OrderEntity({
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
  });

  /** Тестэд ашиглах mock захиалга — PAID (шинэчлэх боломжгүй) */
  const mockPaidOrder = new OrderEntity({
    ...mockPendingOrder,
    status: 'paid',
    paidAt: now,
  });

  /** Тестэд ашиглах mock захиалга — upload хийсний дараах */
  const mockUpdatedOrder = new OrderEntity({
    ...mockPendingOrder,
    status: 'processing',
    proofImageUrl: '/uploads/payments/order-1/proof.png',
  });

  /** Mock файл */
  const mockFile = {
    originalname: 'proof.png',
    buffer: Buffer.from('test'),
    mimetype: 'image/png',
    size: 1024,
  } as Express.Multer.File;

  beforeEach(async () => {
    storageService = {
      upload: jest.fn().mockResolvedValue({
        url: '/uploads/payments/order-1/proof.png',
        sizeBytes: 1024,
      }),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadPaymentProofUseCase,
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
          provide: STORAGE_SERVICE,
          useValue: storageService,
        },
      ],
    }).compile();

    useCase = module.get<UploadPaymentProofUseCase>(UploadPaymentProofUseCase);
    orderRepository = module.get(OrderRepository);
    paymentCacheService = module.get(PaymentCacheService);
  });

  it('захиалга олдоогүй үед NotFoundException шидэх', async () => {
    orderRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('nonexistent', 'user-1', mockFile)).rejects.toThrow(
      NotFoundException,
    );

    expect(orderRepository.findById).toHaveBeenCalledWith('nonexistent');
  });

  it('эзэмшигч биш хэрэглэгч дээр ForbiddenException шидэх', async () => {
    orderRepository.findById.mockResolvedValue(mockPendingOrder);

    await expect(useCase.execute('order-1', 'other-user', mockFile)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('PENDING биш статустай захиалгад BadRequestException шидэх', async () => {
    orderRepository.findById.mockResolvedValue(mockPaidOrder);

    await expect(useCase.execute('order-1', 'user-1', mockFile)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('файл илгээгээгүй үед BadRequestException шидэх', async () => {
    await expect(useCase.execute('order-1', 'user-1', undefined as any)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('амжилттай баримт upload хийх', async () => {
    orderRepository.findById.mockResolvedValue(mockPendingOrder);
    orderRepository.update.mockResolvedValue(mockUpdatedOrder);

    const result = await useCase.execute('order-1', 'user-1', mockFile);

    expect(result).toEqual(mockUpdatedOrder);
    expect(storageService.upload).toHaveBeenCalledWith(mockFile, 'payments/order-1/proof.png');
    expect(orderRepository.update).toHaveBeenCalledWith('order-1', {
      proofImageUrl: '/uploads/payments/order-1/proof.png',
      status: 'processing',
    });
    expect(paymentCacheService.invalidateOrder).toHaveBeenCalledWith('order-1');
  });
});
