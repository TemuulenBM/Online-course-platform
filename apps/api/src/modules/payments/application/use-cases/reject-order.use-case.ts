import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { OrderRepository } from '../../infrastructure/repositories/order.repository';
import { PaymentCacheService } from '../../infrastructure/services/payment-cache.service';
import { RejectOrderDto } from '../../dto/reject-order.dto';
import { OrderEntity } from '../../domain/entities/order.entity';

/**
 * Захиалга татгалзах use case.
 * Админ төлбөрийн баримтыг шалгаж захиалгыг татгалзана.
 * Bull Queue-ээр notification илгээнэ.
 */
@Injectable()
export class RejectOrderUseCase {
  private readonly logger = new Logger(RejectOrderUseCase.name);

  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly paymentCacheService: PaymentCacheService,
    @InjectQueue('payments') private readonly paymentQueue: Queue,
  ) {}

  async execute(orderId: string, dto: RejectOrderDto): Promise<OrderEntity> {
    /** 1. Захиалга олдох эсэх шалгах */
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundException('Захиалга олдсонгүй');
    }

    /** 2. Статус шалгах — зөвхөн PENDING эсвэл PROCESSING */
    if (order.status !== 'pending' && order.status !== 'processing') {
      throw new BadRequestException(
        'Зөвхөн хүлээгдэж буй эсвэл шалгагдаж буй захиалгыг татгалзах боломжтой',
      );
    }

    /** 3. Захиалга шинэчлэх — status → failed, adminNote */
    const updated = await this.orderRepository.update(orderId, {
      status: 'failed',
      adminNote: dto.adminNote,
    });

    /** 4. Bull Queue-д payment-rejected job нэмэх */
    await this.paymentQueue.add('payment-rejected', { orderId });

    /** 5. Кэш invalidate */
    await this.paymentCacheService.invalidateOrder(orderId);

    this.logger.log(`Захиалга татгалзагдлаа: ${orderId}, шалтгаан: ${dto.adminNote}`);

    return updated;
  }
}
