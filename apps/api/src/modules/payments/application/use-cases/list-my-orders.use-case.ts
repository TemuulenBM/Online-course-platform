import { Injectable } from '@nestjs/common';
import { OrderRepository } from '../../infrastructure/repositories/order.repository';
import { ListOrdersQueryDto } from '../../dto/list-orders-query.dto';

/**
 * Миний захиалгуудын жагсаалт авах use case.
 * Хэрэглэгчийн бүх захиалгыг pagination + status шүүлтүүрээр буцаана.
 */
@Injectable()
export class ListMyOrdersUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(userId: string, query: ListOrdersQueryDto) {
    const result = await this.orderRepository.findByUserId(userId, {
      page: query.page ?? 1,
      limit: query.limit ?? 20,
      status: query.status,
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
