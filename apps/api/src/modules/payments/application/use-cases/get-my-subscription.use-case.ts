import { Injectable, Logger } from '@nestjs/common';
import { PaymentCacheService } from '../../infrastructure/services/payment-cache.service';
import { SubscriptionEntity } from '../../domain/entities/subscription.entity';

/**
 * Миний идэвхтэй бүртгэл авах use case.
 * Кэшээс эхлээд хайна, олдоогүй бол null буцаана (алдаа биш).
 */
@Injectable()
export class GetMySubscriptionUseCase {
  private readonly logger = new Logger(GetMySubscriptionUseCase.name);

  constructor(private readonly paymentCacheService: PaymentCacheService) {}

  async execute(userId: string): Promise<SubscriptionEntity | null> {
    /** Кэшээс эхлээд идэвхтэй бүртгэл хайна */
    const subscription = await this.paymentCacheService.getActiveSubscription(userId);

    if (subscription) {
      this.logger.debug(`Идэвхтэй бүртгэл олдлоо: userId=${userId}`);
    }

    return subscription;
  }
}
