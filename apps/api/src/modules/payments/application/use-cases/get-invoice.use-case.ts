import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InvoiceRepository } from '../../infrastructure/repositories/invoice.repository';
import { InvoiceEntity } from '../../domain/entities/invoice.entity';

/**
 * Нэхэмжлэхийн дэлгэрэнгүй авах use case.
 * Эрхийн шалгалт: захиалга эзэмшигч эсвэл ADMIN.
 */
@Injectable()
export class GetInvoiceUseCase {
  private readonly logger = new Logger(GetInvoiceUseCase.name);

  constructor(private readonly invoiceRepository: InvoiceRepository) {}

  async execute(
    invoiceId: string,
    currentUserId: string,
    currentUserRole: string,
  ): Promise<InvoiceEntity> {
    /** 1. Нэхэмжлэх хайх */
    const invoice = await this.invoiceRepository.findById(invoiceId);
    if (!invoice) {
      throw new NotFoundException('Нэхэмжлэх олдсонгүй');
    }

    /** 2. Эрхийн шалгалт — захиалга эзэмшигч эсвэл ADMIN */
    if (invoice.orderUserId !== currentUserId && currentUserRole !== 'ADMIN') {
      throw new ForbiddenException('Энэ нэхэмжлэхийг харах эрхгүй байна');
    }

    this.logger.debug(`Нэхэмжлэх олдлоо: ${invoiceId}`);

    return invoice;
  }
}
