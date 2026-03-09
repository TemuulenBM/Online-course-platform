import { Injectable, Logger } from '@nestjs/common';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { PasswordResetRepository } from '../../infrastructure/repositories/password-reset.repository';
import { TokenService } from '../../infrastructure/services/token.service';
import { NotificationService } from '../../../notifications/application/services/notification.service';
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
    private readonly notificationService: NotificationService,
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

      // Нууц үг сэргээх захидал илгээх
      try {
        await this.notificationService.send(user.id, {
          type: 'EMAIL' as any,
          title: 'Нууц үг сэргээх',
          message: 'Нууц үг сэргээх холбоос таны имэйлд илгээгдлээ.',
          data: {
            email: user.email,
            subject: 'OCP: Нууц үг сэргээх',
            htmlContent: `
              <h2>Нууц үг сэргээх</h2>
              <p>Нууц үгээ сэргээхийн тулд доорх товчийг дарна уу:</p>
              <p>
                <a href="${process.env.APP_URL || 'http://localhost:3000'}/reset-password?token=${rawToken}"
                   style="background:#6366f1;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">
                  Нууц үг сэргээх
                </a>
              </p>
              <p>Энэ холбоос 1 цагийн дараа хүчингүй болно.</p>
              <p>Хэрэв та хүсэлт илгээгээгүй бол үл тоомсорлоно уу.</p>
            `,
          },
        });
      } catch (error) {
        this.logger.warn(
          `Нууц үг сэргээх захидал илгээхэд алдаа: ${user.email}`,
          error instanceof Error ? error.message : String(error),
        );
      }

      this.logger.log(`Нууц үг сэргээх токен үүсгэгдлээ: ${user.email}`);
    }

    // User enumeration-аас хамгаалж үргэлж амжилттай хариу буцаана
    return {
      message: 'Хэрэв энэ имэйл бүртгэлтэй бол нууц үг сэргээх зааварчилгаа илгээгдлээ',
    };
  }
}
