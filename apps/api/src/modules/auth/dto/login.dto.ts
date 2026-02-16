import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Нэвтрэх хүсэлтийн DTO.
 * Хэрэглэгч нэвтрэхэд шаардлагатай мэдээллийг хүлээн авна.
 */
export class LoginDto {
  @ApiProperty({ description: 'Имэйл хаяг', example: 'user@example.com' })
  @IsEmail({}, { message: 'Имэйл хаягийн формат буруу байна' })
  @IsNotEmpty({ message: 'Имэйл хаяг заавал шаардлагатай' })
  email!: string;

  @ApiProperty({ description: 'Нууц үг', example: 'password123' })
  @IsString({ message: 'Нууц үг тэмдэгт мөр байх ёстой' })
  @MinLength(8, { message: 'Нууц үг хамгийн багадаа 8 тэмдэгт байх ёстой' })
  password!: string;
}
