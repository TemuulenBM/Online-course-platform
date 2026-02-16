import { Injectable, Logger } from '@nestjs/common';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { PasswordResetRepository } from '../../infrastructure/repositories/password-reset.repository';
import { TokenService } from '../../infrastructure/services/token.service';
import { randomBytes } from 'crypto';

/**
 * Нууц үг сэргээх хүсэлт use case.
 * Имэйлээр хэрэглэгч олж, нууц үг сэргээх токен үүсгэж, хэшлэж хадгална.
 * User enumeration-аас хамгаалсан — имэйл олдсон эсэхээс үл хамааран амжилттай хариу буцаана.
 */
@Injectable()
export class ForgotPasswordUseCase {
  private readonly logger = new Logger(ForgotPasswordUseCase.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordResetRepository: PasswordResetRepository,
    private readonly tokenService: TokenService,
  ) {}

  async execute(email: string) {
    const user = await this.userRepository.findByEmail(email.toLowerCase());

    if (user) {
      // Нууц үг сэргээх токен үүсгэх
      const rawToken = randomBytes(32).toString('hex');
      const hashedToken = this.tokenService.hashToken(rawToken);

      // 1 цагийн хугацаатай хадгалах
      await this.passwordResetRepository.create({
        userId: user.id,
        token: hashedToken,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      });

      // Dev горимд console-д хэвлэх (бодит системд имэйлээр илгээнэ)
      this.logger.log(`Нууц үг сэргээх токен (${user.email}): ${rawToken}`);
    }

    // User enumeration-аас хамгаалж үргэлж амжилттай хариу буцаана
    return {
      message: 'Хэрэв энэ имэйл бүртгэлтэй бол нууц үг сэргээх зааварчилгаа илгээгдлээ',
    };
  }
}
