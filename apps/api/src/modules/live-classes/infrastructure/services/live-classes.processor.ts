import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { LiveSessionRepository } from '../repositories/live-session.repository';
import { SessionAttendeeRepository } from '../repositories/session-attendee.repository';
import { EnrollmentRepository } from '../../../enrollments/infrastructure/repositories/enrollment.repository';
import { NotificationService } from '../../../notifications/application/services/notification.service';
import { LiveClassesCacheService } from './live-classes-cache.service';

/**
 * Live classes Bull Queue processor.
 * Background-д notification илгээх, ирц шинэчлэх, бичлэг хадгалах.
 */
@Processor('live-classes')
export class LiveClassesProcessor {
  private readonly logger = new Logger(LiveClassesProcessor.name);

  constructor(
    private readonly liveSessionRepository: LiveSessionRepository,
    private readonly sessionAttendeeRepository: SessionAttendeeRepository,
    private readonly enrollmentRepository: EnrollmentRepository,
    private readonly notificationService: NotificationService,
    private readonly liveClassesCacheService: LiveClassesCacheService,
  ) {}

  /** Session эхлэхэд элсэлттэй оюутнуудад notification илгээх */
  @Process('session-started')
  async handleSessionStarted(job: Job<{ sessionId: string; courseId: string }>): Promise<void> {
    const { sessionId, courseId } = job.data;
    this.logger.log(`Session эхлэлийн notification илгээж эхэллээ: ${sessionId}`);

    try {
      const session = await this.liveSessionRepository.findById(sessionId);
      if (!session) {
        this.logger.warn(`Session олдсонгүй: ${sessionId}`);
        return;
      }

      /** ACTIVE элсэлттэй хэрэглэгчдийг олох */
      const enrollments = await this.enrollmentRepository.findByCourseId(courseId, {
        page: 1,
        limit: 1000,
        status: 'ACTIVE',
      });

      const userIds = enrollments.data.map((e) => e.userId);
      if (userIds.length === 0) return;

      /** Notification илгээх */
      await Promise.all(
        userIds.map((userId) =>
          this.notificationService
            .send(userId, {
              type: 'IN_APP',
              title: 'Шууд хичээл эхэллээ!',
              message: `"${session.title}" шууд хичээл одоо эхэллээ. Нэгдэхийн тулд дарна уу.`,
              data: {
                sessionId: session.id,
                courseId,
                lessonId: session.lessonId,
              },
            })
            .catch((err) =>
              this.logger.warn(`Notification илгээхэд алдаа: userId=${userId}, ${err}`),
            ),
        ),
      );

      this.logger.log(
        `Session эхлэлийн notification дууслаа: ${sessionId} (${userIds.length} хэрэглэгч)`,
      );
    } catch (error) {
      this.logger.error(
        `Session-started processor алдаа: ${sessionId}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  /** Session дуусахад бүх attendee-г markLeft + notification */
  @Process('session-ended')
  async handleSessionEnded(job: Job<{ sessionId: string; courseId: string }>): Promise<void> {
    const { sessionId, courseId } = job.data;
    this.logger.log(`Session дуусгалт эхэллээ: ${sessionId}`);

    try {
      /** Бүх гараагүй attendee-г markLeft */
      await this.sessionAttendeeRepository.markAllLeft(sessionId);

      /** Кэш invalidate */
      const session = await this.liveSessionRepository.findById(sessionId);
      if (session) {
        await this.liveClassesCacheService.invalidateSession(sessionId, session.lessonId);
      }

      /** ACTIVE элсэлттэй хэрэглэгчдэд notification */
      const enrollments = await this.enrollmentRepository.findByCourseId(courseId, {
        page: 1,
        limit: 1000,
        status: 'ACTIVE',
      });

      const userIds = enrollments.data.map((e) => e.userId);
      if (userIds.length > 0 && session) {
        await Promise.all(
          userIds.map((userId) =>
            this.notificationService
              .send(userId, {
                type: 'IN_APP',
                title: 'Шууд хичээл дууслаа',
                message: `"${session.title}" шууд хичээл дууслаа. Бичлэг удахгүй бэлэн болно.`,
                data: {
                  sessionId: session.id,
                  courseId,
                  lessonId: session.lessonId,
                },
              })
              .catch((err) =>
                this.logger.warn(`Notification илгээхэд алдаа: userId=${userId}, ${err}`),
              ),
          ),
        );
      }

      this.logger.log(`Session дуусгалт дууслаа: ${sessionId}`);
    } catch (error) {
      this.logger.error(
        `Session-ended processor алдаа: ${sessionId}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  /** Session эхлэхээс 15 мин өмнө сануулга (delayed job) */
  @Process('session-reminder')
  async handleSessionReminder(job: Job<{ sessionId: string; courseId: string }>): Promise<void> {
    const { sessionId, courseId } = job.data;
    this.logger.log(`Session сануулга илгээж эхэллээ: ${sessionId}`);

    try {
      const session = await this.liveSessionRepository.findById(sessionId);
      if (!session || session.status !== 'scheduled') {
        this.logger.warn(`Session олдоогүй эсвэл цуцлагдсан: ${sessionId}`);
        return;
      }

      /** ACTIVE элсэлттэй хэрэглэгчид */
      const enrollments = await this.enrollmentRepository.findByCourseId(courseId, {
        page: 1,
        limit: 1000,
        status: 'ACTIVE',
      });

      const userIds = enrollments.data.map((e) => e.userId);
      if (userIds.length === 0) return;

      await Promise.all(
        userIds.map((userId) =>
          this.notificationService
            .send(userId, {
              type: 'IN_APP',
              title: 'Шууд хичээл удахгүй эхэлнэ!',
              message: `"${session.title}" шууд хичээл 15 минутын дараа эхэлнэ. Бэлтгэлээ хангана уу.`,
              data: {
                sessionId: session.id,
                courseId,
                lessonId: session.lessonId,
              },
            })
            .catch((err) =>
              this.logger.warn(`Reminder notification алдаа: userId=${userId}, ${err}`),
            ),
        ),
      );

      this.logger.log(`Session сануулга дууслаа: ${sessionId} (${userIds.length} хэрэглэгч)`);
    } catch (error) {
      this.logger.error(
        `Session-reminder processor алдаа: ${sessionId}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  /** Бичлэг бэлэн болоход recordingUrl шинэчлэх */
  @Process('recording-ready')
  async handleRecordingReady(job: Job<{ sessionId: string; recordingUrl: string }>): Promise<void> {
    const { sessionId, recordingUrl } = job.data;
    this.logger.log(`Бичлэг бэлэн болж эхэллээ: ${sessionId}`);

    try {
      const session = await this.liveSessionRepository.findById(sessionId);
      if (!session) {
        this.logger.warn(`Session олдсонгүй: ${sessionId}`);
        return;
      }

      /** recordingUrl шинэчлэх */
      await this.liveSessionRepository.update(sessionId, { recordingUrl });

      /** Кэш invalidate */
      await this.liveClassesCacheService.invalidateSession(sessionId, session.lessonId);

      /** Instructor-д notification */
      await this.notificationService.send(session.instructorId, {
        type: 'IN_APP',
        title: 'Бичлэг бэлэн боллоо',
        message: `"${session.title}" шууд хичээлийн бичлэг бэлэн боллоо.`,
        data: {
          sessionId: session.id,
          lessonId: session.lessonId,
          recordingUrl,
        },
      });

      this.logger.log(`Бичлэг бэлэн дууслаа: ${sessionId}`);
    } catch (error) {
      this.logger.error(
        `Recording-ready processor алдаа: ${sessionId}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
