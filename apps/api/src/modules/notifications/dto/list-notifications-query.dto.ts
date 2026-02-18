import { IsOptional, IsInt, Min, Max, IsEnum, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Мэдэгдлүүдийн жагсаалтын pagination + filter query DTO.
 */
export class ListNotificationsQueryDto {
  @ApiPropertyOptional({ description: 'Хуудасны дугаар', example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Хуудасны дугаар бүхэл тоо байх ёстой' })
  @Min(1, { message: 'Хуудасны дугаар 1-ээс багагүй байх ёстой' })
  page?: number;

  @ApiPropertyOptional({
    description: 'Хуудас дахь бичлэгийн тоо',
    example: 20,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Хязгаар бүхэл тоо байх ёстой' })
  @Min(1, { message: 'Хязгаар 1-ээс багагүй байх ёстой' })
  @Max(100, { message: 'Хязгаар 100-аас ихгүй байх ёстой' })
  limit?: number;

  @ApiPropertyOptional({
    description: 'Мэдэгдлийн төрлөөр шүүх',
    enum: ['EMAIL', 'PUSH', 'IN_APP', 'SMS'],
  })
  @IsOptional()
  @IsEnum(['EMAIL', 'PUSH', 'IN_APP', 'SMS'], {
    message: 'Төрөл EMAIL, PUSH, IN_APP, SMS-ийн аль нэг байх ёстой',
  })
  type?: string;

  @ApiPropertyOptional({
    description: 'Уншсан/уншаагүй эсэхээр шүүх',
    example: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean({ message: 'read утга boolean байх ёстой' })
  read?: boolean;
}
