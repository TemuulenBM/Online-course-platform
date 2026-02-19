import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { OrderRepository } from '../../infrastructure/repositories/order.repository';
import { PaymentCacheService } from '../../infrastructure/services/payment-cache.service';
import { ApproveOrderDto } from '../../dto/approve-order.dto';
import { OrderEntity } from '../../domain/entities/order.entity';

/**
 * Захиалга баталгаажуулах use case.
 * Админ төлбөрийн баримтыг шалгаж захиалгыг батална.
 * Bull Queue-ээр enrollment үүсгэх, invoice үүсгэх, notification илгээх.
 */
@Injectable()
export class ApproveOrderUseCase {
  private readonly logger = new Logger(ApproveOrderUseCase.name);

  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly paymentCacheService: PaymentCacheService,
    @InjectQueue('payments') private readonly paymentQueue: Queue,
  ) {}

  async execute(orderId: string, dto: ApproveOrderDto): Promise<OrderEntity> {
    /** 1. Захиалга олдох эсэх шалгах */
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundException('Захиалга олдсонгүй');
    }

    /** 2. Статус шалгах — зөвхөн PENDING эсвэл PROCESSING */
    if (order.status !== 'pending' && order.status !== 'processing') {
      throw new BadRequestException(
        'Зөвхөн хүлээгдэж буй эсвэл шалгагдаж буй захиалгыг баталгаажуулах боломжтой',
      );
    }

    /** 3. Захиалга шинэчлэх — status → paid, paidAt, adminNote */
    const updated = await this.orderRepository.update(orderId, {
      status: 'paid',
      paidAt: new Date(),
      adminNote: dto.adminNote,
    });

    /** 4. Bull Queue-д payment-approved job нэмэх */
    await this.paymentQueue.add('payment-approved', { orderId });

    /** 5. Кэш invalidate */
    await this.paymentCacheService.invalidateOrder(orderId);

    this.logger.log(`Захиалга баталгаажлаа: ${orderId}, хэрэглэгч: ${order.userId}`);

    return updated;
  }
}
