import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bull';
import { PaymentProcessor } from '../../infrastructure/services/payment.processor';
import { OrderRepository } from '../../infrastructure/repositories/order.repository';
import { InvoiceRepository } from '../../infrastructure/repositories/invoice.repository';
import { EnrollmentRepository } from '../../../enrollments/infrastructure/repositories/enrollment.repository';
import { NotificationService } from '../../../notifications/application/services/notification.service';
import { PaymentCacheService } from '../../infrastructure/services/payment-cache.service';
import { InvoicePdfService } from '../../infrastructure/services/invoice-pdf.service';
import { STORAGE_SERVICE } from '../../../content/infrastructure/services/storage/storage.interface';
import { OrderEntity } from '../../domain/entities/order.entity';
import { InvoiceEntity } from '../../domain/entities/invoice.entity';

describe('PaymentProcessor', () => {
  let processor: PaymentProcessor;
  let orderRepository: jest.Mocked<OrderRepository>;
  let invoiceRepository: jest.Mocked<InvoiceRepository>;
  let enrollmentRepository: jest.Mocked<EnrollmentRepository>;
  let notificationService: jest.Mocked<NotificationService>;
  let paymentCacheService: jest.Mocked<PaymentCacheService>;
  let paymentQueue: { add: jest.Mock };

  const now = new Date();

  /** Тестэд ашиглах mock захиалга */
  const mockOrder = new OrderEntity({
    id: 'order-1',
    userId: 'user-1',
    courseId: 'course-1',
    amount: 50000,
    currency: 'MNT',
    status: 'approved',
    paymentMethod: 'bank_transfer',
    externalPaymentId: null,
    proofImageUrl: 'uploads/proof.jpg',
    adminNote: null,
    metadata: null,
    paidAt: now,
    createdAt: now,
    updatedAt: now,
    userName: 'John Doe',
    userEmail: 'john@example.com',
    courseTitle: 'Test Course',
  });

  /** Тестэд ашиглах mock захиалга (татгалзсан, admin тэмдэглэлтэй) */
  const mockRejectedOrder = new OrderEntity({
    id: 'order-2',
    userId: 'user-1',
    courseId: 'course-1',
    amount: 50000,
    currency: 'MNT',
    status: 'rejected',
    paymentMethod: 'bank_transfer',
    externalPaymentId: null,
    proofImageUrl: 'uploads/proof.jpg',
    adminNote: 'Баримт тодорхойгүй',
    metadata: null,
    paidAt: null,
    createdAt: now,
    updatedAt: now,
    userName: 'John Doe',
    userEmail: 'john@example.com',
    courseTitle: 'Test Course',
  });

  /** Тестэд ашиглах mock нэхэмжлэх */
  const mockInvoice = new InvoiceEntity({
    id: 'inv-1',
    orderId: 'order-1',
    invoiceNumber: 'INV-2026-ABCD1234',
    amount: 50000,
    currency: 'MNT',
    pdfUrl: null,
    createdAt: now,
    courseTitle: 'Test Course',
    userName: 'John Doe',
    userEmail: 'john@example.com',
    orderUserId: 'user-1',
  });

  beforeEach(async () => {
    paymentQueue = { add: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentProcessor,
        {
          provide: OrderRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: InvoiceRepository,
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: EnrollmentRepository,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: NotificationService,
          useValue: {
            send: jest.fn(),
          },
        },
        {
          provide: PaymentCacheService,
          useValue: {
            invalidateOrder: jest.fn(),
          },
        },
        {
          provide: InvoicePdfService,
          useValue: {
            generateInvoicePdf: jest.fn(),
          },
        },
        {
          provide: STORAGE_SERVICE,
          useValue: {
            upload: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getQueueToken('payments'),
          useValue: paymentQueue,
        },
      ],
    }).compile();

    processor = module.get<PaymentProcessor>(PaymentProcessor);
    orderRepository = module.get(OrderRepository);
    invoiceRepository = module.get(InvoiceRepository);
    enrollmentRepository = module.get(EnrollmentRepository);
    notificationService = module.get(NotificationService);
    paymentCacheService = module.get(PaymentCacheService);
  });

  describe('handlePaymentApproved', () => {
    it('enrollment үүсгэх + invoice үүсгэх + notification илгээх', async () => {
      orderRepository.findById.mockResolvedValue(mockOrder);
      enrollmentRepository.create.mockResolvedValue({} as any);
      invoiceRepository.create.mockResolvedValue(mockInvoice);
      notificationService.send.mockResolvedValue(undefined);
      paymentCacheService.invalidateOrder.mockResolvedValue(undefined);

      const job = { data: { orderId: 'order-1' } } as any;
      await processor.handlePaymentApproved(job);

      /** Enrollment үүсгэсэн эсэх */
      expect(enrollmentRepository.create).toHaveBeenCalledWith({
        userId: 'user-1',
        courseId: 'course-1',
      });

      /** Invoice үүсгэсэн эсэх */
      expect(invoiceRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          orderId: 'order-1',
          invoiceNumber: expect.any(String),
          amount: 50000,
          currency: 'MNT',
        }),
      );

      /** Notification илгээсэн эсэх */
      expect(notificationService.send).toHaveBeenCalledWith(
        'user-1',
        expect.objectContaining({
          type: 'IN_APP',
          title: 'Төлбөр амжилттай',
        }),
      );

      /** Invoice PDF queue-д нэмэгдсэн эсэх */
      expect(paymentQueue.add).toHaveBeenCalledWith('generate-invoice-pdf', {
        invoiceId: 'inv-1',
      });

      /** Кэш invalidate хийгдсэн эсэх */
      expect(paymentCacheService.invalidateOrder).toHaveBeenCalledWith('order-1');
    });

    it('захиалга олдоогүй бол return хийх', async () => {
      orderRepository.findById.mockResolvedValue(null);

      const job = { data: { orderId: 'order-999' } } as any;
      await processor.handlePaymentApproved(job);

      expect(enrollmentRepository.create).not.toHaveBeenCalled();
      expect(invoiceRepository.create).not.toHaveBeenCalled();
      expect(notificationService.send).not.toHaveBeenCalled();
    });

    it('давхардсан enrollment (P2002) алгасаж үргэлжлүүлэх', async () => {
      orderRepository.findById.mockResolvedValue(mockOrder);

      const p2002Error = new Error('Unique constraint failed');
      (p2002Error as any).code = 'P2002';
      enrollmentRepository.create.mockRejectedValue(p2002Error);
      invoiceRepository.create.mockResolvedValue(mockInvoice);
      notificationService.send.mockResolvedValue(undefined);
      paymentCacheService.invalidateOrder.mockResolvedValue(undefined);

      const job = { data: { orderId: 'order-1' } } as any;
      await processor.handlePaymentApproved(job);

      /** P2002 алдааг алгасаж invoice, notification үргэлжилсэн эсэх */
      expect(invoiceRepository.create).toHaveBeenCalled();
      expect(notificationService.send).toHaveBeenCalled();
    });
  });

  describe('handlePaymentRejected', () => {
    it('notification илгээх + кэш invalidate', async () => {
      orderRepository.findById.mockResolvedValue(mockRejectedOrder);
      notificationService.send.mockResolvedValue(undefined);
      paymentCacheService.invalidateOrder.mockResolvedValue(undefined);

      const job = { data: { orderId: 'order-2' } } as any;
      await processor.handlePaymentRejected(job);

      /** Notification илгээсэн эсэх */
      expect(notificationService.send).toHaveBeenCalledWith(
        'user-1',
        expect.objectContaining({
          type: 'IN_APP',
          title: 'Төлбөр татгалзагдлаа',
        }),
      );

      /** Кэш invalidate хийгдсэн эсэх */
      expect(paymentCacheService.invalidateOrder).toHaveBeenCalledWith('order-2');
    });

    it('захиалга олдоогүй бол return хийх', async () => {
      orderRepository.findById.mockResolvedValue(null);

      const job = { data: { orderId: 'order-999' } } as any;
      await processor.handlePaymentRejected(job);

      expect(notificationService.send).not.toHaveBeenCalled();
    });
  });
});
