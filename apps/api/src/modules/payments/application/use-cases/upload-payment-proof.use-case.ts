import {
  Injectable,
  Inject,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { OrderRepository } from '../../infrastructure/repositories/order.repository';
import { PaymentCacheService } from '../../infrastructure/services/payment-cache.service';
import {
  IStorageService,
  STORAGE_SERVICE,
} from '../../../content/infrastructure/services/storage/storage.interface';
import { OrderEntity } from '../../domain/entities/order.entity';

/**
 * Төлбөрийн баримт upload хийх use case.
 * Хэрэглэгч банкны шилжүүлгийн баримт зургийг upload хийнэ.
 * Зөвхөн PENDING захиалгад upload хийх боломжтой.
 */
@Injectable()
export class UploadPaymentProofUseCase {
  private readonly logger = new Logger(UploadPaymentProofUseCase.name);

  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly paymentCacheService: PaymentCacheService,
    @Inject(STORAGE_SERVICE)
    private readonly storageService: IStorageService,
  ) {}

  async execute(orderId: string, userId: string, file: Express.Multer.File): Promise<OrderEntity> {
    if (!file) {
      throw new BadRequestException('Файл илгээгдээгүй');
    }

    /** 1. Захиалга олдох эсэх шалгах */
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundException('Захиалга олдсонгүй');
    }

    /** 2. Эзэмшигчийн шалгалт */
    if (order.userId !== userId) {
      throw new ForbiddenException('Зөвхөн өөрийн захиалгад баримт upload хийх боломжтой');
    }

    /** 3. Статус шалгах — зөвхөн PENDING */
    if (order.status !== 'pending') {
      throw new BadRequestException('Зөвхөн хүлээгдэж буй захиалгад баримт upload хийх боломжтой');
    }

    /** 4. Файлыг хадгалах */
    const ext = file.originalname.split('.').pop() || 'jpg';
    const storagePath = `payments/${orderId}/proof.${ext}`;
    const { url } = await this.storageService.upload(file, storagePath);

    /** 5. Захиалга шинэчлэх — proofImageUrl, status → processing */
    const updated = await this.orderRepository.update(orderId, {
      proofImageUrl: url,
      status: 'processing',
    });

    /** 6. Кэш invalidate */
    await this.paymentCacheService.invalidateOrder(orderId);

    this.logger.log(`Төлбөрийн баримт upload хийгдлээ: orderId=${orderId}, userId=${userId}`);

    return updated;
  }
}
