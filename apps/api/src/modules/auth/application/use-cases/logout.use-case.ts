import { Injectable, Logger } from '@nestjs/common';
import { SessionRepository } from '../../infrastructure/repositories/session.repository';
import { RefreshTokenRepository } from '../../infrastructure/repositories/refresh-token.repository';

/**
 * Гарах use case.
 * Хэрэглэгчийн бүх сесси болон refresh token-ийг цуцална.
 */
@Injectable()
export class LogoutUseCase {
  private readonly logger = new Logger(LogoutUseCase.name);

  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async execute(userId: string) {
    // Бүх сесси устгах
    await this.sessionRepository.deleteAllByUserId(userId);

    // Бүх refresh token цуцлах
    await this.refreshTokenRepository.revokeAllByUserId(userId);

    this.logger.log(`Хэрэглэгч системээс гарлаа: ${userId}`);
  }
}
