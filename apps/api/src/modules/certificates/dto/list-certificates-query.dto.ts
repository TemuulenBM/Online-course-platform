import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Сертификатуудын жагсаалтын pagination query DTO.
 */
export class ListCertificatesQueryDto {
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
}
