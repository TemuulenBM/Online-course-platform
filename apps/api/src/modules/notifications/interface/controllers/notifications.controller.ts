import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { ListNotificationsUseCase } from '../../application/use-cases/list-notifications.use-case';
import { GetUnreadCountUseCase } from '../../application/use-cases/get-unread-count.use-case';
import { MarkAsReadUseCase } from '../../application/use-cases/mark-as-read.use-case';
import { MarkAllReadUseCase } from '../../application/use-cases/mark-all-read.use-case';
import { DeleteNotificationUseCase } from '../../application/use-cases/delete-notification.use-case';
import { GetPreferencesUseCase } from '../../application/use-cases/get-preferences.use-case';
import { UpdatePreferencesUseCase } from '../../application/use-cases/update-preferences.use-case';
import { ListNotificationsQueryDto } from '../../dto/list-notifications-query.dto';
import { UpdatePreferencesDto } from '../../dto/update-preferences.dto';

/**
 * Мэдэгдлийн controller.
 * Мэдэгдэл жагсаалт, уншсан болгох, тохиргоо удирдах endpoint-ууд.
 */
@ApiTags('Мэдэгдэл')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(
    private readonly listNotificationsUseCase: ListNotificationsUseCase,
    private readonly getUnreadCountUseCase: GetUnreadCountUseCase,
    private readonly markAsReadUseCase: MarkAsReadUseCase,
    private readonly markAllReadUseCase: MarkAllReadUseCase,
    private readonly deleteNotificationUseCase: DeleteNotificationUseCase,
    private readonly getPreferencesUseCase: GetPreferencesUseCase,
    private readonly updatePreferencesUseCase: UpdatePreferencesUseCase,
  ) {}

  /** Уншаагүй мэдэгдлийн тоо — :id-ээс ӨМНӨ */
  @Get('unread-count')
  @ApiOperation({ summary: 'Уншаагүй мэдэгдлийн тоо' })
  @ApiResponse({ status: 200, description: 'Уншаагүй тоо' })
  async getUnreadCount(@CurrentUser('id') userId: string) {
    return this.getUnreadCountUseCase.execute(userId);
  }

  /** Мэдэгдлийн тохиргоо авах — :id-ээс ӨМНӨ */
  @Get('preferences')
  @ApiOperation({ summary: 'Мэдэгдлийн тохиргоо авах' })
  @ApiResponse({ status: 200, description: 'Тохиргооны мэдээлэл' })
  async getPreferences(@CurrentUser('id') userId: string) {
    const preference = await this.getPreferencesUseCase.execute(userId);
    return preference.toResponse();
  }

  /** Бүх мэдэгдлийг уншсан болгох — :id-ээс ӨМНӨ */
  @Patch('mark-all-read')
  @ApiOperation({ summary: 'Бүх мэдэгдлийг уншсан болгох' })
  @ApiResponse({ status: 200, description: 'Шинэчлэгдсэн тоо' })
  async markAllRead(@CurrentUser('id') userId: string) {
    return this.markAllReadUseCase.execute(userId);
  }

  /** Мэдэгдлийн тохиргоо шинэчлэх — :id-ээс ӨМНӨ */
  @Patch('preferences')
  @ApiOperation({ summary: 'Мэдэгдлийн тохиргоо шинэчлэх' })
  @ApiResponse({ status: 200, description: 'Шинэчлэгдсэн тохиргоо' })
  async updatePreferences(@CurrentUser('id') userId: string, @Body() dto: UpdatePreferencesDto) {
    const preference = await this.updatePreferencesUseCase.execute(userId, dto);
    return preference.toResponse();
  }

  /** Мэдэгдлүүдийн жагсаалт */
  @Get()
  @ApiOperation({ summary: 'Мэдэгдлүүдийн жагсаалт' })
  @ApiResponse({ status: 200, description: 'Мэдэгдлүүдийн жагсаалт pagination-тэй' })
  async listNotifications(
    @CurrentUser('id') userId: string,
    @Query() query: ListNotificationsQueryDto,
  ) {
    const result = await this.listNotificationsUseCase.execute(userId, {
      page: query.page ?? 1,
      limit: query.limit ?? 20,
      type: query.type,
      read: query.read,
    });
    return {
      data: result.data.map((n) => n.toResponse()),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  /** Нэг мэдэгдлийг уншсан болгох */
  @Patch(':id/read')
  @ApiOperation({ summary: 'Мэдэгдлийг уншсан болгох' })
  @ApiResponse({ status: 200, description: 'Шинэчлэгдсэн мэдэгдэл' })
  @ApiResponse({ status: 404, description: 'Олдсонгүй' })
  @ApiResponse({ status: 403, description: 'Эрхгүй' })
  async markAsRead(@CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string) {
    const notification = await this.markAsReadUseCase.execute(id, userId);
    return notification.toResponse();
  }

  /** Мэдэгдэл устгах */
  @Delete(':id')
  @ApiOperation({ summary: 'Мэдэгдэл устгах' })
  @ApiResponse({ status: 200, description: 'Амжилттай устгагдлаа' })
  @ApiResponse({ status: 404, description: 'Олдсонгүй' })
  @ApiResponse({ status: 403, description: 'Эрхгүй' })
  async deleteNotification(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.deleteNotificationUseCase.execute(id, userId, userRole);
    return { message: 'Мэдэгдэл амжилттай устгагдлаа' };
  }
}
