import { Controller, Get, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { ListMyInvoicesUseCase } from '../../application/use-cases/list-my-invoices.use-case';
import { GetInvoiceUseCase } from '../../application/use-cases/get-invoice.use-case';
import { ListInvoicesQueryDto } from '../../dto/list-invoices-query.dto';

/**
 * Нэхэмжлэхийн controller.
 * Нэхэмжлэхүүдийн жагсаалт, дэлгэрэнгүй endpoint-ууд.
 */
@ApiTags('Төлбөр — Нэхэмжлэх')
@Controller('payments/invoices')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InvoicesController {
  constructor(
    private readonly listMyInvoicesUseCase: ListMyInvoicesUseCase,
    private readonly getInvoiceUseCase: GetInvoiceUseCase,
  ) {}

  /** Миний нэхэмжлэхүүд */
  @Get('my')
  @ApiOperation({ summary: 'Миний нэхэмжлэхүүд' })
  @ApiResponse({ status: 200, description: 'Нэхэмжлэхүүдийн жагсаалт' })
  async listMyInvoices(@CurrentUser('id') userId: string, @Query() query: ListInvoicesQueryDto) {
    return this.listMyInvoicesUseCase.execute(userId, {
      page: query.page ?? 1,
      limit: query.limit ?? 20,
    });
  }

  /** Нэхэмжлэхийн дэлгэрэнгүй */
  @Get(':id')
  @ApiOperation({ summary: 'Нэхэмжлэхийн дэлгэрэнгүй' })
  @ApiResponse({ status: 200, description: 'Нэхэмжлэхийн мэдээлэл' })
  @ApiResponse({ status: 404, description: 'Олдсонгүй' })
  @ApiResponse({ status: 403, description: 'Эрхгүй' })
  async getInvoice(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    const invoice = await this.getInvoiceUseCase.execute(id, userId, userRole);
    return invoice.toResponse();
  }
}
