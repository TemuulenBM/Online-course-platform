import {
  Injectable,
  Inject,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LiveSessionRepository } from '../../infrastructure/repositories/live-session.repository';
import { SessionAttendeeRepository } from '../../infrastructure/repositories/session-attendee.repository';
import { EnrollmentRepository } from '../../../enrollments/infrastructure/repositories/enrollment.repository';
import { IAgoraService, AGORA_SERVICE } from '../../domain/interfaces/agora-service.interface';
import { LiveSessionEntity } from '../../domain/entities/live-session.entity';

/**
 * Session-д нэгдэх use case.
 * LIVE статустай session-д enrolled/instructor/ADMIN нэгдэж Agora token авна.
 */
@Injectable()
export class JoinLiveSessionUseCase {
  constructor(
    private readonly liveSessionRepository: LiveSessionRepository,
    private readonly sessionAttendeeRepository: SessionAttendeeRepository,
    private readonly enrollmentRepository: EnrollmentRepository,
    @Inject(AGORA_SERVICE) private readonly agoraService: IAgoraService,
    private readonly configService: ConfigService,
  ) {}

  async execute(
    sessionId: string,
    userId: string,
    userRole: string,
  ): Promise<{
    session: LiveSessionEntity;
    token: string;
    channelName: string;
    uid: number;
    appId: string;
  }> {
    /** 1. Session олдох + LIVE шалгах */
    const session = await this.liveSessionRepository.findById(sessionId);
    if (!session) {
      throw new NotFoundException('Шууд хичээл олдсонгүй');
    }

    if (session.status !== 'live') {
      throw new BadRequestException('Зөвхөн идэвхтэй (LIVE) шууд хичээлд нэгдэх боломжтой');
    }

    /** 2. Эрхийн шалгалт */
    const isInstructor = session.instructorId === userId;
    const isAdmin = userRole === 'ADMIN';

    if (!isInstructor && !isAdmin) {
      const enrollment = await this.enrollmentRepository.findByUserAndCourse(
        userId,
        session.courseId!,
      );
      if (!enrollment || enrollment.status !== 'active') {
        throw new ForbiddenException('Зөвхөн элсэлттэй хэрэглэгч нэгдэх боломжтой');
      }
    }

    /** 3. Attendance бүртгэх */
    await this.sessionAttendeeRepository.upsert({
      liveSessionId: sessionId,
      userId,
    });

    /** 4. Agora тохиргоо бэлэн эсэх шалгах */
    if (!this.agoraService.isReady()) {
      throw new BadRequestException(
        'Agora тохиргоо хийгдээгүй байна. AGORA_APP_ID, AGORA_APP_CERTIFICATE .env файлд тохируулна уу.',
      );
    }

    /** 5. Agora token үүсгэх */
    const channelName = this.agoraService.generateChannelName(sessionId);
    const uid = this.generateUid(userId);
    /** Бүх оролцогч publisher — камер/микрофон ашиглах боломжтой */
    const role = 'publisher';
    const token = this.agoraService.generateRtcToken(channelName, uid, role);

    const appId = this.configService.get<string>('agora.appId') || '';

    return { session, token, channelName, uid, appId };
  }

  /** userId-аас deterministic uid үүсгэнэ (CRC32-like hash) */
  private generateUid(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash) % 1000000;
  }
}
