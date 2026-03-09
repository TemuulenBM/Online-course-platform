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
import { CourseRepository } from '../../../courses/infrastructure/repositories/course.repository';
import { LiveSessionEntity } from '../../domain/entities/live-session.entity';
import { CreateLiveSessionDto } from '../../dto/create-live-session.dto';

/**
 * Шууд хичээл товлох use case.
 * TEACHER/ADMIN эрхтэй хэрэглэгч lessonType=LIVE хичээлд session товлоно.
 * lessonId байхгүй бол courseId ашиглан автоматаар LIVE хичээл үүсгэнэ.
 */
@Injectable()
export class ScheduleLiveSessionUseCase {
  constructor(
    private readonly liveSessionRepository: LiveSessionRepository,
    private readonly lessonRepository: LessonRepository,
    private readonly courseRepository: CourseRepository,
    @InjectQueue('live-classes') private readonly liveClassesQueue: Queue,
  ) {}

  async execute(
    userId: string,
    userRole: string,
    dto: CreateLiveSessionDto,
  ): Promise<LiveSessionEntity> {
    let lessonId: string;
    let instructorId: string;
    let courseId: string;

    if (dto.lessonId) {
      /** 1a. lessonId өгөгдсөн бол — хичээл олдох + lessonType шалгах */
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

      lessonId = dto.lessonId;
      instructorId = lesson.courseInstructorId!;
      courseId = lesson.courseId;
    } else if (dto.courseId) {
      /** 1b. courseId өгөгдсөн бол — сургалт олдох + эрх шалгах + LIVE хичээл автоматаар үүсгэх */
      const course = await this.courseRepository.findById(dto.courseId);
      if (!course) {
        throw new NotFoundException('Сургалт олдсонгүй');
      }

      /** Эрхийн шалгалт */
      if (userRole !== 'ADMIN' && course.instructorId !== userId) {
        throw new ForbiddenException('Зөвхөн сургалтын эзэмшигч товлох боломжтой');
      }

      /** Автоматаар LIVE хичээл үүсгэх */
      const nextOrder = await this.lessonRepository.getNextOrderIndex(dto.courseId);
      const autoLesson = await this.lessonRepository.create({
        courseId: dto.courseId,
        title: dto.title,
        orderIndex: nextOrder,
        lessonType: 'live',
        isPublished: true,
      });

      lessonId = autoLesson.id;
      instructorId = course.instructorId;
      courseId = dto.courseId;
    } else {
      throw new BadRequestException('lessonId эсвэл courseId заавал байх ёстой');
    }

    /** 4. Цагийн шалгалт */
    const scheduledStart = new Date(dto.scheduledStart);
    const scheduledEnd = new Date(dto.scheduledEnd);

    if (scheduledStart >= scheduledEnd) {
      throw new BadRequestException('Эхлэх цаг дуусах цагаас өмнө байх ёстой');
    }

    /** 5 минутаас өмнөх цаг хориглох (яг одоо эхлүүлэхийг зөвшөөрнө) */
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (scheduledStart < fiveMinutesAgo) {
      throw new BadRequestException('Өнгөрсөн цаг руу товлох боломжгүй');
    }

    /** 5. Session үүсгэх */
    const session = await this.liveSessionRepository.create({
      lessonId,
      instructorId,
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
        { sessionId: session.id, courseId },
        { delay: reminderDelay },
      );
    }

    return session;
  }
}
