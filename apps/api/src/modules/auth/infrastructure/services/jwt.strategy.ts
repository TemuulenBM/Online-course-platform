import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from '../repositories/user.repository';

/**
 * JWT Passport стратеги.
 * Bearer token-аас хэрэглэгчийг тодорхойлно.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userRepository: UserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret'),
    });
  }

  /**
   * JWT payload-аас хэрэглэгчийг олж request.user-д оноох.
   * Token хүчинтэй боловч хэрэглэгч олдохгүй бол алдаа буцаана.
   */
  async validate(payload: { sub: string; email: string; role: string }) {
    const user = await this.userRepository.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('Хэрэглэгч олдсонгүй');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }
}
