import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Бүртгүүлэх хүсэлтийн DTO.
 * Шинэ хэрэглэгч бүртгүүлэхэд шаардлагатай мэдээллийг хүлээн авна.
 */
export class RegisterDto {
  @ApiProperty({ description: 'Имэйл хаяг', example: 'user@example.com' })
  @IsEmail({}, { message: 'Имэйл хаягийн формат буруу байна' })
  @IsNotEmpty({ message: 'Имэйл хаяг заавал шаардлагатай' })
  email!: string;

  @ApiProperty({ description: 'Нууц үг (хамгийн багадаа 8 тэмдэгт)', example: 'password123' })
  @IsString({ message: 'Нууц үг тэмдэгт мөр байх ёстой' })
  @MinLength(8, { message: 'Нууц үг хамгийн багадаа 8 тэмдэгт байх ёстой' })
  password!: string;

  @ApiProperty({ description: 'Нэр', example: 'Бат' })
  @IsString({ message: 'Нэр тэмдэгт мөр байх ёстой' })
  @IsNotEmpty({ message: 'Нэр заавал шаардлагатай' })
  firstName!: string;

  @ApiProperty({ description: 'Овог', example: 'Дорж' })
  @IsString({ message: 'Овог тэмдэгт мөр байх ёстой' })
  @IsNotEmpty({ message: 'Овог заавал шаардлагатай' })
  lastName!: string;
}
