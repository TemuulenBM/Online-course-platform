import { Injectable, Logger } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { EmailVerificationRepository } from '../../infrastructure/repositories/email-verification.repository';
import { TokenService } from '../../infrastructure/services/token.service';
import { NotificationService } from '../../../notifications/application/services/notification.service';

/**
 * Баталгаажуулах захидлыг дахин илгээх use case.
 * User enumeration-аас хамгаалсан — имэйл олдсон эсэхээс үл хамааран амжилттай хариу буцаана.
 */
@Injectable()
export class ResendVerificationEmailUseCase {
  private readonly logger = new Logger(ResendVerificationEmailUseCase.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly emailVerificationRepository: EmailVerificationRepository,
    private readonly tokenService: TokenService,
    private readonly notificationService: NotificationService,
  ) {}

  async execute(email: string): Promise<{ message: string }> {
    const user = await this.userRepository.findByEmail(email.toLowerCase());

    // Хэрэглэгч олдсон бол + баталгаажаагүй бол шинэ токен илгээнэ
    if (user && !user.emailVerified) {
      const rawToken = randomBytes(32).toString('hex');
      const hashedToken = this.tokenService.hashToken(rawToken);

      await this.emailVerificationRepository.create({
        userId: user.id,
        token: hashedToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      try {
        await this.notificationService.send(user.id, {
          type: 'EMAIL' as any,
          title: 'Имэйл баталгаажуулах захидал',
          message: 'Имэйл баталгаажуулах холбоос дахин илгээгдлээ.',
          data: {
            email: user.email,
            subject: 'OCP: Имэйл хаягаа баталгаажуулна уу',
            htmlContent: `
              <h2>Имэйл баталгаажуулах</h2>
              <p>Доорх товчийг дарж имэйл хаягаа баталгаажуулна уу:</p>
              <p>
                <a href="${process.env.APP_URL || 'http://localhost:3000'}/verify-email?token=${rawToken}"
                   style="background:#6366f1;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">
                  Имэйл баталгаажуулах
                </a>
              </p>
              <p>Токен 24 цагийн дараа хүчингүй болно.</p>
            `,
          },
        });
      } catch (error) {
        this.logger.warn(
          `Баталгаажуулах захидал дахин илгээхэд алдаа: ${user.email}`,
          error instanceof Error ? error.message : String(error),
        );
      }

      this.logger.log(`Баталгаажуулах захидал дахин илгээгдлээ: ${user.email}`);
    }

    // User enumeration-аас хамгаалж үргэлж амжилттай хариу буцаана
    return {
      message: 'Хэрэв энэ имэйл бүртгэлтэй, баталгаажаагүй бол баталгаажуулах захидал илгээгдлээ.',
    };
  }
}
