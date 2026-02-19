import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { PAYMENT_THROTTLE } from '../../../../common/constants/throttle.constants';
import { CreateOrderUseCase } from '../../application/use-cases/create-order.use-case';
import { UploadPaymentProofUseCase } from '../../application/use-cases/upload-payment-proof.use-case';
import { ApproveOrderUseCase } from '../../application/use-cases/approve-order.use-case';
import { RejectOrderUseCase } from '../../application/use-cases/reject-order.use-case';
import { ListMyOrdersUseCase } from '../../application/use-cases/list-my-orders.use-case';
import { GetOrderUseCase } from '../../application/use-cases/get-order.use-case';
import { ListPendingOrdersUseCase } from '../../application/use-cases/list-pending-orders.use-case';
import { CreateOrderDto } from '../../dto/create-order.dto';
import { ListOrdersQueryDto } from '../../dto/list-orders-query.dto';
import { ApproveOrderDto } from '../../dto/approve-order.dto';
import { RejectOrderDto } from '../../dto/reject-order.dto';

/**
 * Захиалгын controller.
 * Захиалга үүсгэх, жагсаалт, баримт upload, баталгаажуулалт endpoint-ууд.
 */
@ApiTags('Төлбөр — Захиалга')
@Controller('payments/orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly uploadPaymentProofUseCase: UploadPaymentProofUseCase,
    private readonly approveOrderUseCase: ApproveOrderUseCase,
    private readonly rejectOrderUseCase: RejectOrderUseCase,
    private readonly listMyOrdersUseCase: ListMyOrdersUseCase,
    private readonly getOrderUseCase: GetOrderUseCase,
    private readonly listPendingOrdersUseCase: ListPendingOrdersUseCase,
  ) {}

  /** Захиалга үүсгэх */
  @Post()
  @Throttle(PAYMENT_THROTTLE)
  @ApiOperation({ summary: 'Захиалга үүсгэх' })
  @ApiResponse({ status: 201, description: 'Захиалга үүслээ' })
  @ApiResponse({ status: 400, description: 'Буруу хүсэлт' })
  @ApiResponse({ status: 409, description: 'Давхардал' })
  async createOrder(
    @CurrentUser('id') userId: string,
    @CurrentUser('email') email: string,
    @Body() dto: CreateOrderDto,
  ) {
    const order = await this.createOrderUseCase.execute(userId, email, dto);
    return order.toResponse();
  }

  /** Миний захиалгууд */
  @Get('my')
  @ApiOperation({ summary: 'Миний захиалгууд' })
  @ApiResponse({ status: 200, description: 'Захиалгуудын жагсаалт' })
  async listMyOrders(@CurrentUser('id') userId: string, @Query() query: ListOrdersQueryDto) {
    return this.listMyOrdersUseCase.execute(userId, {
      page: query.page ?? 1,
      limit: query.limit ?? 20,
      status: query.status,
    });
  }

  /** Хүлээгдэж буй захиалгууд (ADMIN) */
  @Get('pending')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Хүлээгдэж буй захиалгууд (ADMIN)' })
  @ApiResponse({ status: 200, description: 'Жагсаалт' })
  async listPendingOrders(@Query() query: ListOrdersQueryDto) {
    return this.listPendingOrdersUseCase.execute({
      page: query.page ?? 1,
      limit: query.limit ?? 20,
    });
  }

  /** Сургалтын захиалгууд (TEACHER/ADMIN) — ирээдүйд нэмэх */

  /** Захиалгын дэлгэрэнгүй */
  @Get(':id')
  @ApiOperation({ summary: 'Захиалгын дэлгэрэнгүй' })
  @ApiResponse({ status: 200, description: 'Захиалгын мэдээлэл' })
  @ApiResponse({ status: 404, description: 'Олдсонгүй' })
  async getOrder(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    const order = await this.getOrderUseCase.execute(id, userId, userRole);
    return order.toResponse();
  }

  /** Баримт upload хийх */
  @Post(':id/upload-proof')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Төлбөрийн баримт upload хийх' })
  @ApiResponse({ status: 200, description: 'Баримт хадгалагдлаа' })
  @ApiResponse({ status: 400, description: 'Буруу статус' })
  @ApiResponse({ status: 403, description: 'Эрхгүй' })
  async uploadProof(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const order = await this.uploadPaymentProofUseCase.execute(id, userId, file);
    return order.toResponse();
  }

  /** Захиалга баталгаажуулах (ADMIN) */
  @Patch(':id/approve')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Захиалга баталгаажуулах (ADMIN)' })
  @ApiResponse({ status: 200, description: 'Баталгаажуулагдлаа' })
  @ApiResponse({ status: 400, description: 'Буруу статус' })
  async approveOrder(@Param('id', ParseUUIDPipe) id: string, @Body() dto: ApproveOrderDto) {
    const order = await this.approveOrderUseCase.execute(id, dto);
    return order.toResponse();
  }

  /** Захиалга татгалзах (ADMIN) */
  @Patch(':id/reject')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Захиалга татгалзах (ADMIN)' })
  @ApiResponse({ status: 200, description: 'Татгалзагдлаа' })
  @ApiResponse({ status: 400, description: 'Буруу статус' })
  async rejectOrder(@Param('id', ParseUUIDPipe) id: string, @Body() dto: RejectOrderDto) {
    const order = await this.rejectOrderUseCase.execute(id, dto);
    return order.toResponse();
  }
}
