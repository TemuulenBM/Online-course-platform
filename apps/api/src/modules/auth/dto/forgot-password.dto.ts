import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Нууц үг сэргээх хүсэлтийн DTO.
 * Хэрэглэгчийн имэйл хаягийг хүлээн авна.
 */
export class ForgotPasswordDto {
  @ApiProperty({ description: 'Имэйл хаяг', example: 'user@example.com' })
  @IsEmail({}, { message: 'Имэйл хаягийн формат буруу байна' })
  @IsNotEmpty({ message: 'Имэйл хаяг заавал шаардлагатай' })
  email!: string;
}
