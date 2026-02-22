import { Controller, Get, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { GetSystemHealthUseCase } from '../../application/use-cases/get-system-health.use-case';
import { GetPlatformStatsUseCase } from '../../application/use-cases/get-platform-stats.use-case';
import { GetPendingItemsUseCase } from '../../application/use-cases/get-pending-items.use-case';
import { GetRecentActivityUseCase } from '../../application/use-cases/get-recent-activity.use-case';
import { GetModerationStatsUseCase } from '../../application/use-cases/get-moderation-stats.use-case';
import { ListFlaggedContentUseCase } from '../../application/use-cases/list-flagged-content.use-case';
import { ReviewFlaggedContentUseCase } from '../../application/use-cases/review-flagged-content.use-case';
import { ListFlaggedQueryDto } from '../../dto/list-flagged-query.dto';
import { ReviewFlaggedDto } from '../../dto/review-flagged.dto';

/**
 * Admin dashboard controller.
 * Системийн health, статистик, pending items, moderation.
 */
@Controller('admin/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminDashboardController {
  constructor(
    private readonly getSystemHealthUseCase: GetSystemHealthUseCase,
    private readonly getPlatformStatsUseCase: GetPlatformStatsUseCase,
    private readonly getPendingItemsUseCase: GetPendingItemsUseCase,
    private readonly getRecentActivityUseCase: GetRecentActivityUseCase,
    private readonly getModerationStatsUseCase: GetModerationStatsUseCase,
    private readonly listFlaggedContentUseCase: ListFlaggedContentUseCase,
    private readonly reviewFlaggedContentUseCase: ReviewFlaggedContentUseCase,
  ) {}

  /** Системийн health шалгах */
  @Get('health')
  async getHealth() {
    return this.getSystemHealthUseCase.execute();
  }

  /** Платформын ерөнхий статистик */
  @Get('stats')
  async getStats() {
    return this.getPlatformStatsUseCase.execute();
  }

  /** Хүлээгдэж буй зүйлүүд */
  @Get('pending')
  async getPending() {
    return this.getPendingItemsUseCase.execute();
  }

  /** Сүүлийн admin үйлдлүүд */
  @Get('activity')
  async getActivity(@Query('limit') limit?: number) {
    return this.getRecentActivityUseCase.execute(limit ?? 10);
  }

  /** Moderation статистик */
  @Get('moderation')
  async getModerationStats() {
    return this.getModerationStatsUseCase.execute();
  }

  /** Тэмдэглэгдсэн контент жагсаалт */
  @Get('moderation/flagged')
  async listFlagged(@Query() query: ListFlaggedQueryDto) {
    return this.listFlaggedContentUseCase.execute({
      page: query.page ?? 1,
      limit: query.limit ?? 20,
      courseId: query.courseId,
    });
  }

  /** Тэмдэглэгдсэн контент approve (unflag) */
  @Patch('moderation/flagged/:id/approve')
  async approveFlagged(@Param('id') id: string, @CurrentUser('id') userId: string) {
    await this.reviewFlaggedContentUseCase.execute(id, 'approve', userId);
    return { message: 'Нийтлэл амжилттай approve хийгдлээ' };
  }

  /** Тэмдэглэгдсэн контент reject (delete + notification) */
  @Patch('moderation/flagged/:id/reject')
  async rejectFlagged(
    @Param('id') id: string,
    @Body() body: ReviewFlaggedDto,
    @CurrentUser('id') userId: string,
  ) {
    await this.reviewFlaggedContentUseCase.execute(id, 'reject', userId, body.reason);
    return { message: 'Нийтлэл амжилттай reject хийгдлээ' };
  }
}
