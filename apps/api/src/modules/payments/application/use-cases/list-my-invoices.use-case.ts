import { Injectable, Logger } from '@nestjs/common';
import { InvoiceRepository } from '../../infrastructure/repositories/invoice.repository';
import { ListInvoicesQueryDto } from '../../dto/list-invoices-query.dto';

/**
 * Миний нэхэмжлэхүүдийн жагсаалт авах use case.
 * Хэрэглэгчийн бүх нэхэмжлэхийг pagination-тэйгээр буцаана.
 */
@Injectable()
export class ListMyInvoicesUseCase {
  private readonly logger = new Logger(ListMyInvoicesUseCase.name);

  constructor(private readonly invoiceRepository: InvoiceRepository) {}

  async execute(userId: string, query: ListInvoicesQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    /** Хэрэглэгчийн нэхэмжлэхүүд — pagination-тэй */
    const result = await this.invoiceRepository.findByUserId(userId, {
      page,
      limit,
    });

    this.logger.debug(`Нэхэмжлэхүүд олдлоо: userId=${userId}, total=${result.total}`);

    return {
      data: result.data.map((invoice) => invoice.toResponse()),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }
}
