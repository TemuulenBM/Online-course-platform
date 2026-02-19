import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { SubscriptionRepository } from '../../infrastructure/repositories/subscription.repository';
import { PaymentCacheService } from '../../infrastructure/services/payment-cache.service';
import { SubscriptionEntity } from '../../domain/entities/subscription.entity';

/**
 * Бүртгэл цуцлах use case.
 * Идэвхтэй бүртгэлийг period дуустал цуцлах тэмдэглэл хийнэ.
 * Эрхийн шалгалт: өөрийн бүртгэл эсвэл ADMIN.
 */
@Injectable()
export class CancelSubscriptionUseCase {
  private readonly logger = new Logger(CancelSubscriptionUseCase.name);

  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly paymentCacheService: PaymentCacheService,
  ) {}

  async execute(
    subscriptionId: string,
    currentUserId: string,
    currentUserRole: string,
  ): Promise<SubscriptionEntity> {
    /** 1. Бүртгэл хайх */
    const subscription = await this.subscriptionRepository.findById(subscriptionId);
    if (!subscription) {
      throw new NotFoundException('Бүртгэл олдсонгүй');
    }

    /** 2. Эрхийн шалгалт — эзэмшигч эсвэл ADMIN */
    if (subscription.userId !== currentUserId && currentUserRole !== 'ADMIN') {
      throw new ForbiddenException('Энэ бүртгэлийг цуцлах эрхгүй байна');
    }

    /** 3. Зөвхөн идэвхтэй бүртгэлийг цуцлах боломжтой */
    if (subscription.status !== 'active') {
      throw new BadRequestException('Зөвхөн идэвхтэй бүртгэлийг цуцлах боломжтой');
    }

    /** 4. Цуцлалт бүртгэх — period дуустал хүчинтэй */
    const updated = await this.subscriptionRepository.update(subscriptionId, {
      cancelAtPeriodEnd: true,
      cancelledAt: new Date(),
    });

    /** 5. Кэш устгах */
    await this.paymentCacheService.invalidateSubscription(subscriptionId, subscription.userId);

    this.logger.log(`Бүртгэл цуцлагдлаа: ${subscriptionId} (userId=${subscription.userId})`);

    return updated;
  }
}
