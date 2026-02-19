import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PaymentCacheService } from '../../infrastructure/services/payment-cache.service';
import { OrderEntity } from '../../domain/entities/order.entity';

/**
 * Захиалгын дэлгэрэнгүй авах use case.
 * Эрхийн шалгалт: өөрийн захиалга, сургалтын эзэмшигч, эсвэл админ.
 */
@Injectable()
export class GetOrderUseCase {
  constructor(private readonly paymentCacheService: PaymentCacheService) {}

  async execute(
    orderId: string,
    currentUserId: string,
    currentUserRole: string,
  ): Promise<OrderEntity> {
    /** 1. Захиалга олдох эсэх шалгах (кэшээс эхлэнэ) */
    const order = await this.paymentCacheService.getOrder(orderId);
    if (!order) {
      throw new NotFoundException('Захиалга олдсонгүй');
    }

    /** 2. Эрхийн шалгалт: өөрийн захиалга, сургалтын эзэмшигч, эсвэл админ */
    if (
      order.userId !== currentUserId &&
      order.courseInstructorId !== currentUserId &&
      currentUserRole !== 'ADMIN'
    ) {
      throw new ForbiddenException('Энэ захиалгын мэдээлэл харах эрхгүй');
    }

    return order;
  }
}
