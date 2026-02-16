import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { PasswordResetRepository } from '../../infrastructure/repositories/password-reset.repository';
import { SessionRepository } from '../../infrastructure/repositories/session.repository';
import { RefreshTokenRepository } from '../../infrastructure/repositories/refresh-token.repository';
import { TokenService } from '../../infrastructure/services/token.service';
import { hashPassword } from '../../../../common/utils/hash.util';

/**
 * Нууц үг шинэчлэх use case.
 * Токеноор нууц үг сэргээх бичлэг олж, нууц үг шинэчилж, бүх сесси цуцална.
 */
@Injectable()
export class ResetPasswordUseCase {
  private readonly logger = new Logger(ResetPasswordUseCase.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordResetRepository: PasswordResetRepository,
    private readonly sessionRepository: SessionRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly tokenService: TokenService,
  ) {}

  async execute(rawToken: string, newPassword: string) {
    // Токен хэшлэж хүчинтэй бичлэг хайх
    const hashedToken = this.tokenService.hashToken(rawToken);
    const resetRecord = await this.passwordResetRepository.findValidByToken(hashedToken);

    if (!resetRecord) {
      throw new BadRequestException('Токен хүчингүй эсвэл хугацаа дууссан байна');
    }

    // Нууц үг хэшлэж шинэчлэх
    const passwordHash = await hashPassword(newPassword);
    await this.userRepository.updatePassword(resetRecord.userId, passwordHash);

    // Токен ашигласан гэж тэмдэглэх
    await this.passwordResetRepository.markAsUsed(resetRecord.id);

    // Аюулгүй байдлын үүднээс бүх сесси болон refresh token цуцлах
    await this.sessionRepository.deleteAllByUserId(resetRecord.userId);
    await this.refreshTokenRepository.revokeAllByUserId(resetRecord.userId);

    this.logger.log(`Нууц үг амжилттай шинэчлэгдлээ: userId=${resetRecord.userId}`);

    return {
      message: 'Нууц үг амжилттай шинэчлэгдлээ. Шинэ нууц үгээрээ нэвтэрнэ үү.',
    };
  }
}
