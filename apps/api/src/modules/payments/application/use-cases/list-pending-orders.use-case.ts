import { Injectable } from '@nestjs/common';
import { OrderRepository } from '../../infrastructure/repositories/order.repository';
import { ListOrdersQueryDto } from '../../dto/list-orders-query.dto';

/**
 * Хүлээгдэж буй захиалгуудын жагсаалт авах use case.
 * Зөвхөн ADMIN ашиглах — PENDING болон PROCESSING статустай захиалгуудыг буцаана.
 */
@Injectable()
export class ListPendingOrdersUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(query: ListOrdersQueryDto) {
    const result = await this.orderRepository.findPendingOrders({
      page: query.page ?? 1,
      limit: query.limit ?? 20,
    });

    return {
      data: result.data.map((o) => o.toResponse()),
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    };
  }
}
