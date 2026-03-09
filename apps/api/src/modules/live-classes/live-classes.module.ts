import { Module, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { BullModule, InjectQueue } from '@nestjs/bull';
import { ConfigModule } from '@nestjs/config';
import { Queue } from 'bull';

/** Хамааралтай модулиуд */
import { LessonsModule } from '../lessons/lessons.module';
import { CoursesModule } from '../courses/courses.module';
import { EnrollmentsModule } from '../enrollments/enrollments.module';
import { NotificationsModule } from '../notifications/notifications.module';

/** Controller */
import { LiveSessionsController } from './interface/controllers/live-sessions.controller';

/** Use Cases */
import { ScheduleLiveSessionUseCase } from './application/use-cases/schedule-live-session.use-case';
import { GetLiveSessionUseCase } from './application/use-cases/get-live-session.use-case';
import { GetLiveSessionByLessonUseCase } from './application/use-cases/get-live-session-by-lesson.use-case';
import { ListCourseSessionsUseCase } from './application/use-cases/list-course-sessions.use-case';
import { ListUpcomingSessionsUseCase } from './application/use-cases/list-upcoming-sessions.use-case';
import { UpdateLiveSessionUseCase } from './application/use-cases/update-live-session.use-case';
import { CancelLiveSessionUseCase } from './application/use-cases/cancel-live-session.use-case';
import { StartLiveSessionUseCase } from './application/use-cases/start-live-session.use-case';
import { EndLiveSessionUseCase } from './application/use-cases/end-live-session.use-case';
import { JoinLiveSessionUseCase } from './application/use-cases/join-live-session.use-case';
import { LeaveLiveSessionUseCase } from './application/use-cases/leave-live-session.use-case';
import { GetAttendeesUseCase } from './application/use-cases/get-attendees.use-case';
import { GenerateAgoraTokenUseCase } from './application/use-cases/generate-agora-token.use-case';
import { HandleRecordingWebhookUseCase } from './application/use-cases/handle-recording-webhook.use-case';
import { CleanupStaleLiveSessionsUseCase } from './application/use-cases/cleanup-stale-live-sessions.use-case';

/** Infrastructure */
import { LiveSessionRepository } from './infrastructure/repositories/live-session.repository';
import { SessionAttendeeRepository } from './infrastructure/repositories/session-attendee.repository';
import { LiveClassesCacheService } from './infrastructure/services/live-classes-cache.service';
import { AgoraTokenService } from './infrastructure/services/agora-token.service';
import { LiveClassesProcessor } from './infrastructure/services/live-classes.processor';

/** Domain */
import { AGORA_SERVICE } from './domain/interfaces/agora-service.interface';

/**
 * Live Classes модуль (Phase 6).
 * Шууд хичээл товлох, Agora SDK-аар видео дамжуулах, ирц бүртгэх, бичлэг хадгалах.
 */
@Module({
  imports: [
    BullModule.registerQueue({ name: 'live-classes' }),
    ConfigModule,
    LessonsModule,
    CoursesModule,
    EnrollmentsModule,
    NotificationsModule,
  ],
  controllers: [LiveSessionsController],
  providers: [
    /** Use Cases */
    ScheduleLiveSessionUseCase,
    GetLiveSessionUseCase,
    GetLiveSessionByLessonUseCase,
    ListCourseSessionsUseCase,
    ListUpcomingSessionsUseCase,
    UpdateLiveSessionUseCase,
    CancelLiveSessionUseCase,
    StartLiveSessionUseCase,
    EndLiveSessionUseCase,
    JoinLiveSessionUseCase,
    LeaveLiveSessionUseCase,
    GetAttendeesUseCase,
    GenerateAgoraTokenUseCase,
    HandleRecordingWebhookUseCase,
    CleanupStaleLiveSessionsUseCase,

    /** Infrastructure */
    LiveSessionRepository,
    SessionAttendeeRepository,
    LiveClassesCacheService,
    LiveClassesProcessor,

    /** DI Token — ирээдүйд Jitsi/100ms руу солих боломжтой */
    { provide: AGORA_SERVICE, useClass: AgoraTokenService },
  ],
  exports: [LiveSessionRepository],
})
export class LiveClassesModule implements OnApplicationBootstrap {
  private readonly logger = new Logger(LiveClassesModule.name);

  constructor(
    private readonly cleanupStaleLiveSessionsUseCase: CleanupStaleLiveSessionsUseCase,
    @InjectQueue('live-classes') private readonly liveClassesQueue: Queue,
  ) {}

  /**
   * Backend эхлэхэд:
   * 1. Stale LIVE session-уудыг шууд цэвэрлэнэ
   * 2. 30 мин тутам давтагдах cleanup job бүртгэнэ
   */
  async onApplicationBootstrap(): Promise<void> {
    /** 1. Шууд цэвэрлэгээ */
    try {
      const cleaned = await this.cleanupStaleLiveSessionsUseCase.execute();
      if (cleaned > 0) {
        this.logger.warn(`Bootstrap: ${cleaned} stale LIVE session цэвэрлэгдлээ`);
      }
    } catch (error) {
      this.logger.error(
        'Bootstrap stale session цэвэрлэгээ амжилтгүй',
        error instanceof Error ? error.stack : String(error),
      );
    }

    /** 2. Repeatable job — 30 мин тутам */
    try {
      await this.liveClassesQueue.add(
        'cleanup-stale-sessions',
        {},
        {
          repeat: { every: 30 * 60 * 1000 },
          removeOnComplete: true,
          removeOnFail: false,
        },
      );
      this.logger.log('Stale session cleanup repeatable job бүртгэгдлээ (30 мин тутам)');
    } catch (error) {
      this.logger.error(
        'Repeatable job бүртгэхэд алдаа',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
