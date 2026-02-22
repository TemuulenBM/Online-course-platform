import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Headers,
  ParseUUIDPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { Public } from '../../../../common/decorators/public.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { CreateLiveSessionDto } from '../../dto/create-live-session.dto';
import { UpdateLiveSessionDto } from '../../dto/update-live-session.dto';
import { ListLiveSessionsQueryDto } from '../../dto/list-live-sessions-query.dto';
import { RecordingWebhookDto } from '../../dto/recording-webhook.dto';
import { ScheduleLiveSessionUseCase } from '../../application/use-cases/schedule-live-session.use-case';
import { GetLiveSessionUseCase } from '../../application/use-cases/get-live-session.use-case';
import { GetLiveSessionByLessonUseCase } from '../../application/use-cases/get-live-session-by-lesson.use-case';
import { ListCourseSessionsUseCase } from '../../application/use-cases/list-course-sessions.use-case';
import { ListUpcomingSessionsUseCase } from '../../application/use-cases/list-upcoming-sessions.use-case';
import { UpdateLiveSessionUseCase } from '../../application/use-cases/update-live-session.use-case';
import { CancelLiveSessionUseCase } from '../../application/use-cases/cancel-live-session.use-case';
import { StartLiveSessionUseCase } from '../../application/use-cases/start-live-session.use-case';
import { EndLiveSessionUseCase } from '../../application/use-cases/end-live-session.use-case';
import { JoinLiveSessionUseCase } from '../../application/use-cases/join-live-session.use-case';
import { LeaveLiveSessionUseCase } from '../../application/use-cases/leave-live-session.use-case';
import { GetAttendeesUseCase } from '../../application/use-cases/get-attendees.use-case';
import { GenerateAgoraTokenUseCase } from '../../application/use-cases/generate-agora-token.use-case';
import { HandleRecordingWebhookUseCase } from '../../application/use-cases/handle-recording-webhook.use-case';

/**
 * Шууд хичээлийн controller.
 * 14 endpoint — route дараалал чухал!
 */
@Controller('live-sessions')
@UseGuards(JwtAuthGuard)
export class LiveSessionsController {
  constructor(
    private readonly scheduleLiveSessionUseCase: ScheduleLiveSessionUseCase,
    private readonly getLiveSessionUseCase: GetLiveSessionUseCase,
    private readonly getLiveSessionByLessonUseCase: GetLiveSessionByLessonUseCase,
    private readonly listCourseSessionsUseCase: ListCourseSessionsUseCase,
    private readonly listUpcomingSessionsUseCase: ListUpcomingSessionsUseCase,
    private readonly updateLiveSessionUseCase: UpdateLiveSessionUseCase,
    private readonly cancelLiveSessionUseCase: CancelLiveSessionUseCase,
    private readonly startLiveSessionUseCase: StartLiveSessionUseCase,
    private readonly endLiveSessionUseCase: EndLiveSessionUseCase,
    private readonly joinLiveSessionUseCase: JoinLiveSessionUseCase,
    private readonly leaveLiveSessionUseCase: LeaveLiveSessionUseCase,
    private readonly getAttendeesUseCase: GetAttendeesUseCase,
    private readonly generateAgoraTokenUseCase: GenerateAgoraTokenUseCase,
    private readonly handleRecordingWebhookUseCase: HandleRecordingWebhookUseCase,
  ) {}

  /** 1. POST /live-sessions — Session товлох (TEACHER/ADMIN) */
  @Post()
  @UseGuards(RolesGuard)
  @Roles('TEACHER', 'ADMIN')
  async schedule(@CurrentUser() user: any, @Body() dto: CreateLiveSessionDto) {
    const session = await this.scheduleLiveSessionUseCase.execute(user.id, user.role, dto);
    return session.toResponse();
  }

  /** 2. GET /live-sessions/upcoming — Удахгүй эхлэх sessions (@Public) */
  @Get('upcoming')
  @Public()
  async listUpcoming(@Query() query: ListLiveSessionsQueryDto) {
    const result = await this.listUpcomingSessionsUseCase.execute({
      page: query.page || 1,
      limit: query.limit || 20,
    });
    return {
      data: result.data.map((s) => s.toResponse()),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  /** 3. GET /live-sessions/course/:courseId — Сургалтын sessions */
  @Get('course/:courseId')
  async listByCourse(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @CurrentUser() user: any,
    @Query() query: ListLiveSessionsQueryDto,
  ) {
    const result = await this.listCourseSessionsUseCase.execute(courseId, user.id, user.role, {
      page: query.page || 1,
      limit: query.limit || 20,
      status: query.status,
      timeFilter: query.timeFilter || 'all',
    });
    return {
      data: result.data.map((s) => s.toResponse()),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  /** 4. GET /live-sessions/lesson/:lessonId — Хичээлийн session (@Public) */
  @Get('lesson/:lessonId')
  @Public()
  async getByLesson(@Param('lessonId', ParseUUIDPipe) lessonId: string) {
    const session = await this.getLiveSessionByLessonUseCase.execute(lessonId);
    return session.toResponse();
  }

  /** 5. POST /live-sessions/webhook/recording — Бичлэгийн webhook (@Public) */
  @Post('webhook/recording')
  @Public()
  @HttpCode(HttpStatus.OK)
  async recordingWebhook(
    @Body() dto: RecordingWebhookDto,
    @Headers('x-agora-signature') signature?: string,
  ) {
    await this.handleRecordingWebhookUseCase.execute(dto, signature);
    return { received: true };
  }

  /** 6. GET /live-sessions/:id — Session дэлгэрэнгүй */
  @Get(':id')
  async getById(@Param('id', ParseUUIDPipe) id: string) {
    const session = await this.getLiveSessionUseCase.execute(id);
    return session.toResponse();
  }

  /** 7. PATCH /live-sessions/:id — Session шинэчлэх (owner/ADMIN) */
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
    @Body() dto: UpdateLiveSessionDto,
  ) {
    const session = await this.updateLiveSessionUseCase.execute(id, user.id, user.role, dto);
    return session.toResponse();
  }

  /** 8. DELETE /live-sessions/:id — Session цуцлах (owner/ADMIN) */
  @Delete(':id')
  async cancel(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    const session = await this.cancelLiveSessionUseCase.execute(id, user.id, user.role);
    return session.toResponse();
  }

  /** 9. POST /live-sessions/:id/start — Session эхлүүлэх (owner) */
  @Post(':id/start')
  async start(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    const result = await this.startLiveSessionUseCase.execute(id, user.id);
    return {
      session: result.session.toResponse(),
      token: result.token,
      channelName: result.channelName,
    };
  }

  /** 10. POST /live-sessions/:id/end — Session дуусгах (owner) */
  @Post(':id/end')
  async end(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    const session = await this.endLiveSessionUseCase.execute(id, user.id);
    return session.toResponse();
  }

  /** 11. POST /live-sessions/:id/join — Нэгдэх + token авах */
  @Post(':id/join')
  async join(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    const result = await this.joinLiveSessionUseCase.execute(id, user.id, user.role);
    return {
      session: result.session.toResponse(),
      token: result.token,
      channelName: result.channelName,
      uid: result.uid,
    };
  }

  /** 12. POST /live-sessions/:id/leave — Гарах */
  @Post(':id/leave')
  async leave(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    return this.leaveLiveSessionUseCase.execute(id, user.id);
  }

  /** 13. GET /live-sessions/:id/attendees — Ирцийн жагсаалт (owner/ADMIN) */
  @Get(':id/attendees')
  async getAttendees(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
    @Query() query: ListLiveSessionsQueryDto,
  ) {
    const result = await this.getAttendeesUseCase.execute(id, user.id, user.role, {
      page: query.page || 1,
      limit: query.limit || 50,
    });
    return {
      data: result.data.map((a) => a.toResponse()),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  /** 14. GET /live-sessions/:id/token — Agora token шинэчлэх */
  @Get(':id/token')
  async getToken(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    return this.generateAgoraTokenUseCase.execute(id, user.id, user.role);
  }
}
