import {
  Injectable,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { LiveSessionRepository } from '../../infrastructure/repositories/live-session.repository';
import { LessonRepository } from '../../../lessons/infrastructure/repositories/lesson.repository';
import { LiveSessionEntity } from '../../domain/entities/live-session.entity';
import { CreateLiveSessionDto } from '../../dto/create-live-session.dto';

/**
 * Шууд хичээл товлох use case.
 * TEACHER/ADMIN эрхтэй хэрэглэгч lessonType=LIVE хичээлд session товлоно.
 */
@Injectable()
export class ScheduleLiveSessionUseCase {
  constructor(
    private readonly liveSessionRepository: LiveSessionRepository,
    private readonly lessonRepository: LessonRepository,
    @InjectQueue('live-classes') private readonly liveClassesQueue: Queue,
  ) {}

  async execute(
    userId: string,
    userRole: string,
    dto: CreateLiveSessionDto,
  ): Promise<LiveSessionEntity> {
    /** 1. Хичээл олдох + lessonType шалгах */
    const lesson = await this.lessonRepository.findById(dto.lessonId);
    if (!lesson) {
      throw new NotFoundException('Хичээл олдсонгүй');
    }

    if (lesson.lessonType !== 'live') {
      throw new BadRequestException('Зөвхөн LIVE төрлийн хичээлд шууд хичээл товлох боломжтой');
    }

    /** 2. Эрхийн шалгалт — эзэмшигч эсвэл ADMIN */
    if (userRole !== 'ADMIN' && lesson.courseInstructorId !== userId) {
      throw new ForbiddenException('Зөвхөн сургалтын эзэмшигч товлох боломжтой');
    }

    /** 3. Давхардал шалгах */
    const existing = await this.liveSessionRepository.findByLessonId(dto.lessonId);
    if (existing) {
      throw new ConflictException('Энэ хичээлд аль хэдийн шууд хичээл товлогдсон байна');
    }

    /** 4. Цагийн шалгалт */
    const scheduledStart = new Date(dto.scheduledStart);
    const scheduledEnd = new Date(dto.scheduledEnd);

    if (scheduledStart >= scheduledEnd) {
      throw new BadRequestException('Эхлэх цаг дуусах цагаас өмнө байх ёстой');
    }

    if (scheduledStart <= new Date()) {
      throw new BadRequestException('Өнгөрсөн цаг руу товлох боломжгүй');
    }

    /** 5. Session үүсгэх */
    const session = await this.liveSessionRepository.create({
      lessonId: dto.lessonId,
      instructorId: lesson.courseInstructorId!,
      title: dto.title,
      description: dto.description,
      scheduledStart,
      scheduledEnd,
    });

    /** 6. Reminder delayed job (15 минутын өмнө) */
    const reminderDelay = scheduledStart.getTime() - Date.now() - 15 * 60 * 1000;
    if (reminderDelay > 0) {
      await this.liveClassesQueue.add(
        'session-reminder',
        { sessionId: session.id, courseId: lesson.courseId },
        { delay: reminderDelay },
      );
    }

    return session;
  }
}
