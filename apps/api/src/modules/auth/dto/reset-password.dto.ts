import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Нууц үг шинэчлэх хүсэлтийн DTO.
 * Нууц үг сэргээх токен болон шинэ нууц үгийг хүлээн авна.
 */
export class ResetPasswordDto {
  @ApiProperty({ description: 'Нууц үг сэргээх токен' })
  @IsString({ message: 'Токен тэмдэгт мөр байх ёстой' })
  @IsNotEmpty({ message: 'Токен заавал шаардлагатай' })
  token!: string;

  @ApiProperty({
    description: 'Шинэ нууц үг (хамгийн багадаа 8 тэмдэгт)',
    example: 'newpassword123',
  })
  @IsString({ message: 'Нууц үг тэмдэгт мөр байх ёстой' })
  @MinLength(8, { message: 'Нууц үг хамгийн багадаа 8 тэмдэгт байх ёстой' })
  password!: string;
}
