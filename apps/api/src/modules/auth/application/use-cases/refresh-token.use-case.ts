import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { TokenService } from '../../infrastructure/services/token.service';
import { RefreshTokenRepository } from '../../infrastructure/repositories/refresh-token.repository';

/**
 * Токен шинэчлэх use case.
 * Хуучин refresh token-ийг цуцлаад шинэ токен хос (access + refresh) үүсгэнэ.
 * Token rotation хэрэглэнэ — нэг refresh token зөвхөн нэг удаа ашиглагдана.
 */
@Injectable()
export class RefreshTokenUseCase {
  private readonly logger = new Logger(RefreshTokenUseCase.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async execute(rawRefreshToken: string) {
    // Ирсэн refresh token-ийг хэшлэж мэдээллийн сангаас хайх
    const hashedToken = this.tokenService.hashToken(rawRefreshToken);
    const storedToken = await this.refreshTokenRepository.findByToken(hashedToken);

    if (!storedToken) {
      throw new UnauthorizedException('Refresh токен хүчингүй эсвэл хугацаа дууссан байна');
    }

    // Хэрэглэгч олдох эсэх шалгах
    const user = await this.userRepository.findById(storedToken.userId);
    if (!user) {
      throw new UnauthorizedException('Хэрэглэгч олдсонгүй');
    }

    // Хуучин refresh token-ийг цуцлах (token rotation)
    await this.refreshTokenRepository.revoke(storedToken.id);

    // Шинэ access token үүсгэх
    const accessToken = this.tokenService.generateAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    // Шинэ refresh token үүсгэх
    const newRawRefreshToken = this.tokenService.generateRefreshToken();
    const newHashedRefreshToken = this.tokenService.hashToken(newRawRefreshToken);
    await this.refreshTokenRepository.create({
      userId: user.id,
      token: newHashedRefreshToken,
      expiresAt: this.tokenService.getRefreshTokenExpiry(),
    });

    this.logger.log(`Токен шинэчлэгдлээ: ${user.email}`);

    return {
      accessToken,
      refreshToken: newRawRefreshToken,
      user: user.toResponse(),
    };
  }
}
