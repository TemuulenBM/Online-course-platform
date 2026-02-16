import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Токен шинэчлэх хүсэлтийн DTO.
 * Refresh token-ийг хүлээн аваад шинэ токен хос үүсгэнэ.
 */
export class RefreshTokenDto {
  @ApiProperty({ description: 'Refresh токен', example: 'eyJhbGciOiJIUzI1NiIs...' })
  @IsString({ message: 'Refresh токен тэмдэгт мөр байх ёстой' })
  @IsNotEmpty({ message: 'Refresh токен заавал шаардлагатай' })
  refreshToken!: string;
}
