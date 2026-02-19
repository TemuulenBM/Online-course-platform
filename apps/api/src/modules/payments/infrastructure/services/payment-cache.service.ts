import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../../../common/redis/redis.service';
import { OrderRepository } from '../repositories/order.repository';
import { SubscriptionRepository } from '../repositories/subscription.repository';
import { OrderEntity } from '../../domain/entities/order.entity';
import { SubscriptionEntity } from '../../domain/entities/subscription.entity';

/** Төлбөрийн кэшийн TTL — 15 минут (секундээр) */
const PAYMENT_CACHE_TTL = 900;

/**
 * Төлбөрийн кэш сервис.
 * Redis-д захиалга болон бүртгэлийн мэдээлэл кэшлэж, DB ачааллыг бууруулна.
 */
@Injectable()
export class PaymentCacheService {
  private readonly logger = new Logger(PaymentCacheService.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly orderRepository: OrderRepository,
    private readonly subscriptionRepository: SubscriptionRepository,
  ) {}

  /** ID-аар захиалга авах — кэшээс эхлээд, байхгүй бол DB-ээс */
  async getOrder(orderId: string): Promise<OrderEntity | null> {
    const cacheKey = `order:${orderId}`;

    const cached = await this.redisService.get<ReturnType<OrderEntity['toResponse']>>(cacheKey);
    if (cached) {
      this.logger.debug(`Кэшнээс захиалга олдлоо: ${orderId}`);
      return new OrderEntity({
        ...cached,
        metadata: null,
        externalPaymentId: null,
        proofImageUrl: cached.proofImageUrl,
        adminNote: cached.adminNote,
        paidAt: cached.paidAt ? new Date(cached.paidAt) : null,
        createdAt: new Date(cached.createdAt),
        updatedAt: new Date(cached.updatedAt),
      });
    }

    const order = await this.orderRepository.findById(orderId);
    if (order) {
      await this.redisService.set(cacheKey, order.toResponse(), PAYMENT_CACHE_TTL);
      this.logger.debug(`Захиалга кэшлэгдлээ: ${orderId}`);
    }

    return order;
  }

  /** ID-аар бүртгэл авах — кэшээс эхлээд */
  async getSubscription(subscriptionId: string): Promise<SubscriptionEntity | null> {
    const cacheKey = `subscription:${subscriptionId}`;

    const cached =
      await this.redisService.get<ReturnType<SubscriptionEntity['toResponse']>>(cacheKey);
    if (cached) {
      this.logger.debug(`Кэшнээс бүртгэл олдлоо: ${subscriptionId}`);
      return new SubscriptionEntity({
        ...cached,
        externalSubscriptionId: null,
        currentPeriodStart: new Date(cached.currentPeriodStart),
        currentPeriodEnd: new Date(cached.currentPeriodEnd),
        cancelledAt: cached.cancelledAt ? new Date(cached.cancelledAt) : null,
        createdAt: new Date(cached.createdAt),
        updatedAt: new Date(cached.updatedAt),
      });
    }

    const subscription = await this.subscriptionRepository.findById(subscriptionId);
    if (subscription) {
      await this.redisService.set(cacheKey, subscription.toResponse(), PAYMENT_CACHE_TTL);
      this.logger.debug(`Бүртгэл кэшлэгдлээ: ${subscriptionId}`);
    }

    return subscription;
  }

  /** Хэрэглэгчийн идэвхтэй бүртгэл авах */
  async getActiveSubscription(userId: string): Promise<SubscriptionEntity | null> {
    const cacheKey = `subscription:user:${userId}`;

    const cached =
      await this.redisService.get<ReturnType<SubscriptionEntity['toResponse']>>(cacheKey);
    if (cached) {
      this.logger.debug(`Кэшнээс идэвхтэй бүртгэл олдлоо: userId=${userId}`);
      return new SubscriptionEntity({
        ...cached,
        externalSubscriptionId: null,
        currentPeriodStart: new Date(cached.currentPeriodStart),
        currentPeriodEnd: new Date(cached.currentPeriodEnd),
        cancelledAt: cached.cancelledAt ? new Date(cached.cancelledAt) : null,
        createdAt: new Date(cached.createdAt),
        updatedAt: new Date(cached.updatedAt),
      });
    }

    const subscription = await this.subscriptionRepository.findActiveByUserId(userId);
    if (subscription) {
      await this.redisService.set(cacheKey, subscription.toResponse(), PAYMENT_CACHE_TTL);
      this.logger.debug(`Идэвхтэй бүртгэл кэшлэгдлээ: userId=${userId}`);
    }

    return subscription;
  }

  /** Захиалгын кэш устгах */
  async invalidateOrder(orderId: string): Promise<void> {
    await this.redisService.del(`order:${orderId}`);
    this.logger.debug(`Захиалгын кэш устгагдлаа: ${orderId}`);
  }

  /** Бүртгэлийн кэш устгах */
  async invalidateSubscription(subscriptionId: string, userId: string): Promise<void> {
    await Promise.all([
      this.redisService.del(`subscription:${subscriptionId}`),
      this.redisService.del(`subscription:user:${userId}`),
    ]);
    this.logger.debug(`Бүртгэлийн кэш устгагдлаа: ${subscriptionId}`);
  }
}
