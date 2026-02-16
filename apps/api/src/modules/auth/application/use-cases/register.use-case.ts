import { Injectable, ConflictException, Logger } from '@nestjs/common';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { TokenService } from '../../infrastructure/services/token.service';
import { SessionRepository } from '../../infrastructure/repositories/session.repository';
import { RefreshTokenRepository } from '../../infrastructure/repositories/refresh-token.repository';
import { UserProfileRepository } from '../../../users/infrastructure/repositories/user-profile.repository';
import { RegisterDto } from '../../dto/register.dto';
import { hashPassword } from '../../../../common/utils/hash.util';

/**
 * Бүртгүүлэх use case.
 * Имэйл давхардал шалгаж, нууц үг хэшлэж, хэрэглэгч үүсгэж,
 * профайл үүсгэж, токенууд буцаана.
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

    this.logger.log(`Шинэ хэрэглэгч бүртгүүллээ: ${user.email}`);

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      user: user.toResponse(),
    };
  }
}
