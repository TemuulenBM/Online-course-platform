import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { TokenService } from '../../infrastructure/services/token.service';
import { SessionRepository } from '../../infrastructure/repositories/session.repository';
import { RefreshTokenRepository } from '../../infrastructure/repositories/refresh-token.repository';
import { LoginDto } from '../../dto/login.dto';
import { comparePassword } from '../../../../common/utils/hash.util';

/**
 * Нэвтрэх use case.
 * Хэрэглэгч олж, нууц үг шалгаж, сесси үүсгэж, токенууд буцаана.
 * User enumeration-аас хамгаалсан — имэйл болон нууц үгийн алдааг ижил мессежээр буцаана.
 */
@Injectable()
export class LoginUseCase {
  private readonly logger = new Logger(LoginUseCase.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
    private readonly sessionRepository: SessionRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async execute(dto: LoginDto, ipAddress?: string, userAgent?: string) {
    // Хэрэглэгч хайх
    const user = await this.userRepository.findByEmail(dto.email.toLowerCase());
    if (!user) {
      throw new UnauthorizedException('Имэйл эсвэл нууц үг буруу байна');
    }

    // Нууц үг шалгах
    const isPasswordValid = await comparePassword(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Имэйл эсвэл нууц үг буруу байна');
    }

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

    // Сүүлийн нэвтрэлтийн цаг шинэчлэх
    await this.userRepository.updateLastLogin(user.id);

    this.logger.log(`Хэрэглэгч нэвтэрлээ: ${user.email}`);

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      user: user.toResponse(),
    };
  }
}
