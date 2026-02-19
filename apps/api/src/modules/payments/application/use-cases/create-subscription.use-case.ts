import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { SubscriptionRepository } from '../../infrastructure/repositories/subscription.repository';
import { PaymentCacheService } from '../../infrastructure/services/payment-cache.service';
import { CreateSubscriptionDto } from '../../dto/create-subscription.dto';
import { SubscriptionEntity } from '../../domain/entities/subscription.entity';

/**
 * Бүртгэл үүсгэх use case.
 * Шинэ subscription үүсгэж, period start/end тооцоолно.
 * Давхардсан идэвхтэй бүртгэл байвал алдаа буцаана.
 */
@Injectable()
export class CreateSubscriptionUseCase {
  private readonly logger = new Logger(CreateSubscriptionUseCase.name);

  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly paymentCacheService: PaymentCacheService,
  ) {}

  async execute(userId: string, dto: CreateSubscriptionDto): Promise<SubscriptionEntity> {
    /** 1. Идэвхтэй subscription шалгах — давхардал хориглоно */
    const existing = await this.subscriptionRepository.findActiveByUserId(userId);
    if (existing) {
      throw new ConflictException('Идэвхтэй бүртгэл аль хэдийн байна');
    }

    /** 2. Period эхлэл/дуусал тооцоолох */
    const now = new Date();
    const periodEnd = new Date(now);
    if (dto.planType === 'yearly') {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    /** 3. Subscription үүсгэх */
    const subscription = await this.subscriptionRepository.create({
      userId,
      planType: dto.planType,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
    });

    this.logger.log(`Бүртгэл үүсгэгдлээ: ${subscription.id} (${dto.planType}, userId=${userId})`);

    return subscription;
  }
}
