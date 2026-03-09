import { Injectable, ConflictException, Logger } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { TokenService } from '../../infrastructure/services/token.service';
import { SessionRepository } from '../../infrastructure/repositories/session.repository';
import { RefreshTokenRepository } from '../../infrastructure/repositories/refresh-token.repository';
import { EmailVerificationRepository } from '../../infrastructure/repositories/email-verification.repository';
import { UserProfileRepository } from '../../../users/infrastructure/repositories/user-profile.repository';
import { NotificationService } from '../../../notifications/application/services/notification.service';
import { RegisterDto } from '../../dto/register.dto';
import { hashPassword } from '../../../../common/utils/hash.util';

/**
 * Бүртгүүлэх use case.
 * Имэйл давхардал шалгаж, нууц үг хэшлэж, хэрэглэгч үүсгэж,
 * профайл үүсгэж, имэйл баталгаажуулах токен үүсгэж,
 * баталгаажуулах захидал илгээж, токенууд буцаана.
 */
@Injectable()
export class RegisterUseCase {
  private readonly logger = new Logger(RegisterUseCase.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
    private readonly sessionRepository: SessionRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly userProfileRepository: UserProfileRepository,
    private readonly emailVerificationRepository: EmailVerificationRepository,
    private readonly notificationService: NotificationService,
  ) {}

  async execute(dto: RegisterDto, ipAddress?: string, userAgent?: string) {
    // Имэйл давхардал шалгах
    const existingUser = await this.userRepository.findByEmail(dto.email.toLowerCase());
    if (existingUser) {
      throw new ConflictException('Энэ имэйл хаяг бүртгэлтэй байна');
    }

    // Нууц үг хэшлэх
    const passwordHash = await hashPassword(dto.password);

    // Хэрэглэгч үүсгэх
    const user = await this.userRepository.create({
      email: dto.email.toLowerCase(),
      passwordHash,
    });

    // Профайл үүсгэх (firstName, lastName хадгалах)
    await this.userProfileRepository.create({
      userId: user.id,
      firstName: dto.firstName,
      lastName: dto.lastName,
    });

    // Access token үүсгэх
    const accessToken = this.tokenService.generateAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    // Refresh token үүсгэх, хэшлэж хадгалах
    const rawRefreshToken = this.tokenService.generateRefreshToken();
    const hashedRefreshToken = this.tokenService.hashToken(rawRefreshToken);
    await this.refreshTokenRepository.create({
      userId: user.id,
      token: hashedRefreshToken,
      expiresAt: this.tokenService.getRefreshTokenExpiry(),
    });

    // Сесси үүсгэх
    await this.sessionRepository.create({
      userId: user.id,
      token: this.tokenService.hashToken(accessToken),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      ipAddress,
      userAgent,
    });

    // Имэйл баталгаажуулах токен үүсгэх, 24 цагийн хугацаатай хадгалах
    const rawVerifyToken = randomBytes(32).toString('hex');
    const hashedVerifyToken = this.tokenService.hashToken(rawVerifyToken);
    await this.emailVerificationRepository.create({
      userId: user.id,
      token: hashedVerifyToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    // Имэйл баталгаажуулах захидал илгээх (NotificationService → Bull Queue → SendGrid)
    // Алдаа гарсан ч бүртгэлийг цуцлахгүй — захидалгүйгээр ч дахин илгээх боломжтой
    try {
      await this.notificationService.send(user.id, {
        type: 'EMAIL' as any,
        title: 'Имэйл хаягаа баталгаажуулна уу',
        message: `Бүртгэлийг дуусгахын тулд имэйл хаягаа баталгаажуулна уу.`,
        data: {
          email: user.email,
          subject: 'OCP: Имэйл хаягаа баталгаажуулна уу',
          htmlContent: `
            <h2>Тавтай морилно уу!</h2>
            <p>Бүртгэлийг дуусгахын тулд доорх товчийг дарж имэйл хаягаа баталгаажуулна уу:</p>
            <p>
              <a href="${process.env.APP_URL || 'http://localhost:3000'}/verify-email?token=${rawVerifyToken}"
                 style="background:#6366f1;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">
                Имэйл баталгаажуулах
              </a>
            </p>
            <p>Токен 24 цагийн дараа хүчингүй болно.</p>
            <p>Хэрэв та бүртгүүлээгүй бол энэ захидлыг үл тоомсорлоно уу.</p>
          `,
        },
      });
    } catch (error) {
      this.logger.warn(
        `Баталгаажуулах захидал илгээхэд алдаа: ${user.email}`,
        error instanceof Error ? error.message : String(error),
      );
    }

    this.logger.log(`Шинэ хэрэглэгч бүртгүүллээ: ${user.email}`);

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      user: user.toResponse(),
      message: 'Бүртгэл амжилттай. Имэйл хаягаа баталгаажуулахыг хүсье.',
    };
  }
}
