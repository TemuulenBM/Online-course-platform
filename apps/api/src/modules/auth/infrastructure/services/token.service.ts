import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes } from 'crypto';

/**
 * Токен сервис.
 * JWT access token, refresh token үүсгэх, баталгаажуулах,
 * SHA-256 хэшлэх зэрэг үйлдлүүдийг гүйцэтгэнэ.
 */
@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /** Access token үүсгэнэ (JWT) */
  generateAccessToken(payload: { sub: string; email: string; role: string }): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.secret'),
      expiresIn: this.configService.get<string>('jwt.expiration') as any,
    });
  }

  /** Refresh token үүсгэнэ (санамсаргүй тэмдэгт мөр) */
  generateRefreshToken(): string {
    return randomBytes(64).toString('hex');
  }

  /** Тэмдэгт мөрийг SHA-256 хэшлэнэ (refresh token, reset token хадгалахад ашиглана) */
  hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  /** Access token-ийг баталгаажуулна */
  verifyAccessToken(token: string): { sub: string; email: string; role: string } {
    return this.jwtService.verify(token, {
      secret: this.configService.get<string>('jwt.secret'),
    });
  }

  /** Refresh token-ий дуусах хугацааг тооцоолно */
  getRefreshTokenExpiry(): Date {
    const expiration = this.configService.get<string>('jwt.refreshExpiration') || '7d';
    const match = expiration.match(/^(\d+)([dhms])$/);

    if (!match) {
      // Анхдагч 7 хоног
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return new Date(Date.now() + value * multipliers[unit]);
  }
}
