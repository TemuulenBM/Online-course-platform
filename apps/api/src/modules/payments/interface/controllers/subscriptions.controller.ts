import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { SUBSCRIPTION_THROTTLE } from '../../../../common/constants/throttle.constants';
import { CreateSubscriptionUseCase } from '../../application/use-cases/create-subscription.use-case';
import { CancelSubscriptionUseCase } from '../../application/use-cases/cancel-subscription.use-case';
import { GetMySubscriptionUseCase } from '../../application/use-cases/get-my-subscription.use-case';
import { CreateSubscriptionDto } from '../../dto/create-subscription.dto';

/**
 * Бүртгэлийн controller.
 * Subscription үүсгэх, авах, цуцлах endpoint-ууд.
 */
@ApiTags('Төлбөр — Бүртгэл')
@Controller('payments/subscriptions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SubscriptionsController {
  constructor(
    private readonly createSubscriptionUseCase: CreateSubscriptionUseCase,
    private readonly cancelSubscriptionUseCase: CancelSubscriptionUseCase,
    private readonly getMySubscriptionUseCase: GetMySubscriptionUseCase,
  ) {}

  /** Бүртгэл эхлүүлэх */
  @Post()
  @Throttle(SUBSCRIPTION_THROTTLE)
  @ApiOperation({ summary: 'Бүртгэл эхлүүлэх' })
  @ApiResponse({ status: 201, description: 'Бүртгэл үүслээ' })
  @ApiResponse({ status: 409, description: 'Аль хэдийн идэвхтэй бүртгэл байна' })
  async createSubscription(@CurrentUser('id') userId: string, @Body() dto: CreateSubscriptionDto) {
    const subscription = await this.createSubscriptionUseCase.execute(userId, dto);
    return subscription.toResponse();
  }

  /** Миний бүртгэл */
  @Get('my')
  @ApiOperation({ summary: 'Миний бүртгэл' })
  @ApiResponse({ status: 200, description: 'Бүртгэлийн мэдээлэл' })
  async getMySubscription(@CurrentUser('id') userId: string) {
    const subscription = await this.getMySubscriptionUseCase.execute(userId);
    return subscription ? subscription.toResponse() : null;
  }

  /** Бүртгэл цуцлах */
  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Бүртгэл цуцлах' })
  @ApiResponse({ status: 200, description: 'Цуцлагдлаа' })
  @ApiResponse({ status: 400, description: 'Идэвхтэй биш' })
  @ApiResponse({ status: 403, description: 'Эрхгүй' })
  async cancelSubscription(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    const subscription = await this.cancelSubscriptionUseCase.execute(id, userId, userRole);
    return subscription.toResponse();
  }
}
