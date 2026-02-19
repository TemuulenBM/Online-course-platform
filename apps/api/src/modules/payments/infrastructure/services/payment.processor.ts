import { Processor, Process, InjectQueue } from '@nestjs/bull';
import { Inject, Logger } from '@nestjs/common';
import { Job, Queue } from 'bull';
import { OrderRepository } from '../repositories/order.repository';
import { InvoiceRepository } from '../repositories/invoice.repository';
import { EnrollmentRepository } from '../../../enrollments/infrastructure/repositories/enrollment.repository';
import { NotificationService } from '../../../notifications/application/services/notification.service';
import { PaymentCacheService } from './payment-cache.service';
import { InvoicePdfService } from './invoice-pdf.service';
import {
  IStorageService,
  STORAGE_SERVICE,
} from '../../../content/infrastructure/services/storage/storage.interface';
import { generateInvoiceNumber } from '../../../../common/utils/invoice.util';

/**
 * Төлбөрийн Bull Queue processor.
 * Background-д enrollment үүсгэх, invoice үүсгэх, notification илгээх, PDF үүсгэх.
 */
@Processor('payments')
export class PaymentProcessor {
  private readonly logger = new Logger(PaymentProcessor.name);

  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly invoiceRepository: InvoiceRepository,
    private readonly enrollmentRepository: EnrollmentRepository,
    private readonly notificationService: NotificationService,
    private readonly paymentCacheService: PaymentCacheService,
    private readonly invoicePdfService: InvoicePdfService,
    @Inject(STORAGE_SERVICE)
    private readonly storageService: IStorageService,
    @InjectQueue('payments')
    private readonly paymentQueue: Queue,
  ) {}

  /**
   * Төлбөр баталгаажсан — enrollment + invoice + notification.
   * Admin approve хийхэд дуудагдана.
   */
  @Process('payment-approved')
  async handlePaymentApproved(job: Job<{ orderId: string }>): Promise<void> {
    const { orderId } = job.data;
    this.logger.log(`Төлбөр баталгаажуулалт эхэллээ: ${orderId}`);

    /** 1. Order мэдээлэл авах */
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      this.logger.error(`Захиалга олдсонгүй: ${orderId}`);
      return;
    }

    /** 2. Enrollment үүсгэх (courseId байгаа бол) */
    if (order.courseId) {
      try {
        await this.enrollmentRepository.create({
          userId: order.userId,
          courseId: order.courseId,
        });
        this.logger.log(`Элсэлт үүслээ: user=${order.userId}, course=${order.courseId}`);
      } catch (error: any) {
        /** Аль хэдийн элсэлт байвал алгасна (P2002 unique violation) */
        if (error.code === 'P2002') {
          this.logger.warn(
            `Элсэлт аль хэдийн байна: user=${order.userId}, course=${order.courseId}`,
          );
        } else {
          throw error;
        }
      }
    }

    /** 3. Invoice үүсгэх (retry 3 удаа давхардлын хувьд) */
    let invoice;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        invoice = await this.invoiceRepository.create({
          orderId: order.id,
          invoiceNumber: generateInvoiceNumber(),
          amount: order.amount,
          currency: order.currency,
        });
        break;
      } catch (error: any) {
        if (error.code === 'P2002' && attempt < 2) {
          this.logger.warn(`Invoice дугаар давхардал, дахин оролдож байна (${attempt + 1}/3)`);
          continue;
        }
        throw error;
      }
    }

    /** 4. Notification илгээх */
    await this.notificationService.send(order.userId, {
      type: 'IN_APP',
      title: 'Төлбөр амжилттай',
      message: `"${order.courseTitle || 'Сургалт'}" сургалтын төлбөр баталгаажлаа. Та одоо сургалтад хандах боломжтой.`,
      data: {
        orderId: order.id,
        courseId: order.courseId,
        email: order.userEmail,
      },
    });

    /** 5. Invoice PDF үүсгэх (async) */
    if (invoice) {
      await this.paymentQueue.add('generate-invoice-pdf', {
        invoiceId: invoice.id,
      });
    }

    /** 6. Кэш invalidate */
    await this.paymentCacheService.invalidateOrder(orderId);

    this.logger.log(`Төлбөр баталгаажуулалт дууслаа: ${orderId}`);
  }

  /** Төлбөр татгалзсан — notification илгээх */
  @Process('payment-rejected')
  async handlePaymentRejected(job: Job<{ orderId: string }>): Promise<void> {
    const { orderId } = job.data;
    this.logger.log(`Төлбөр татгалзалт эхэллээ: ${orderId}`);

    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      this.logger.error(`Захиалга олдсонгүй: ${orderId}`);
      return;
    }

    /** Notification илгээх */
    await this.notificationService.send(order.userId, {
      type: 'IN_APP',
      title: 'Төлбөр татгалзагдлаа',
      message: `"${order.courseTitle || 'Сургалт'}" сургалтын төлбөрийн баримт хүлээн авагдсангүй. ${order.adminNote ? `Шалтгаан: ${order.adminNote}` : ''}`,
      data: {
        orderId: order.id,
        courseId: order.courseId,
        email: order.userEmail,
      },
    });

    /** Кэш invalidate */
    await this.paymentCacheService.invalidateOrder(orderId);

    this.logger.log(`Төлбөр татгалзалт дууслаа: ${orderId}`);
  }

  /** Invoice PDF үүсгэх */
  @Process('generate-invoice-pdf')
  async handleGenerateInvoicePdf(job: Job<{ invoiceId: string }>): Promise<void> {
    const { invoiceId } = job.data;
    this.logger.log(`Invoice PDF үүсгэж эхэллээ: ${invoiceId}`);

    /** 1. Invoice + Order мэдээлэл авах */
    const invoice = await this.invoiceRepository.findById(invoiceId);
    if (!invoice) {
      this.logger.error(`Нэхэмжлэх олдсонгүй: ${invoiceId}`);
      return;
    }

    /** 2. PDF Buffer үүсгэх */
    const pdfBuffer = await this.invoicePdfService.generateInvoicePdf({
      invoiceNumber: invoice.invoiceNumber,
      amount: invoice.amount,
      currency: invoice.currency,
      courseTitle: invoice.courseTitle || 'Сургалт',
      userName: invoice.userName || 'Хэрэглэгч',
      userEmail: invoice.userEmail || '',
      createdAt: invoice.createdAt,
    });

    /** 3. Файл хадгалах */
    const pdfPath = `invoices/${invoiceId}/invoice.pdf`;
    const { url: pdfUrl } = await this.storageService.upload(
      { buffer: pdfBuffer, size: pdfBuffer.length } as any,
      pdfPath,
    );

    /** 4. DB шинэчлэх */
    await this.invoiceRepository.update(invoiceId, { pdfUrl });

    this.logger.log(`Invoice PDF амжилттай үүслээ: ${invoiceId} (${pdfUrl})`);
  }
}
