import {
  Injectable,
  Inject,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LiveSessionRepository } from '../../infrastructure/repositories/live-session.repository';
import { EnrollmentRepository } from '../../../enrollments/infrastructure/repositories/enrollment.repository';
import { IAgoraService, AGORA_SERVICE } from '../../domain/interfaces/agora-service.interface';

/**
 * Agora RTC token шинэчлэх use case.
 * LIVE session-д enrolled/instructor/ADMIN Agora token авна.
 */
@Injectable()
export class GenerateAgoraTokenUseCase {
  constructor(
    private readonly liveSessionRepository: LiveSessionRepository,
    private readonly enrollmentRepository: EnrollmentRepository,
    private readonly configService: ConfigService,
    @Inject(AGORA_SERVICE) private readonly agoraService: IAgoraService,
  ) {}

  async execute(
    sessionId: string,
    userId: string,
    userRole: string,
  ): Promise<{
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
      throw new BadRequestException('Зөвхөн идэвхтэй (LIVE) шууд хичээлд токен авах боломжтой');
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
        throw new ForbiddenException('Зөвхөн элсэлттэй хэрэглэгч токен авах боломжтой');
      }
    }

    /** 3. Token үүсгэх */
    const channelName = this.agoraService.generateChannelName(sessionId);
    const uid = this.generateUid(userId);
    const role = isInstructor ? 'publisher' : 'subscriber';
    const token = this.agoraService.generateRtcToken(channelName, uid, role);

    const appId = this.configService.get<string>('agora.appId') || '';

    return { token, channelName, uid, appId };
  }

  /** userId-аас deterministic uid үүсгэнэ */
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
