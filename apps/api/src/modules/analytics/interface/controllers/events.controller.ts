import { Controller, Get, Post, Body, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { Public } from '../../../../common/decorators/public.decorator';
import { TrackEventUseCase } from '../../application/use-cases/track-event.use-case';
import { ListEventsUseCase } from '../../application/use-cases/list-events.use-case';
import { TrackEventDto } from '../../dto/track-event.dto';
import { ListEventsQueryDto } from '../../dto/list-events-query.dto';

/**
 * Event tracking controller.
 * Event бүртгэх (public) + Event жагсаалт (ADMIN).
 */
@ApiTags('Аналитик — Events')
@Controller('analytics/events')
export class EventsController {
  constructor(
    private readonly trackEventUseCase: TrackEventUseCase,
    private readonly listEventsUseCase: ListEventsUseCase,
  ) {}

  @Post('track')
  @Public()
  @ApiOperation({ summary: 'Event бүртгэх (public)' })
  @ApiResponse({ status: 201, description: 'Event queue-д нэмэгдлээ' })
  async trackEvent(@Body() dto: TrackEventDto, @Req() req: Request) {
    const user = req.user as { id?: string } | undefined;
    return this.trackEventUseCase.execute(dto, {
      userId: user?.id ?? null,
      ipAddress: req.ip ?? null,
      userAgent: req.headers['user-agent'] ?? null,
    });
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Event жагсаалт (ADMIN only)' })
  @ApiResponse({ status: 200, description: 'Event log pagination-тэй' })
  async listEvents(@Query() query: ListEventsQueryDto) {
    return this.listEventsUseCase.execute({
      page: query.page ?? 1,
      limit: query.limit ?? 20,
      eventName: query.eventName,
      eventCategory: query.eventCategory,
      userId: query.userId,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
    });
  }
}
