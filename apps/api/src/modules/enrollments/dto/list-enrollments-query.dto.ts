import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Элсэлтүүдийн жагсаалтын query DTO.
 */
export class ListEnrollmentsQueryDto {
  @ApiProperty({ description: 'Хуудасны дугаар', example: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Хуудасны дугаар бүхэл тоо байна' })
  @Min(1, { message: 'Хуудасны дугаар 1-ээс багагүй' })
  page?: number = 1;

  @ApiProperty({ description: 'Хуудасны хэмжээ', example: 20, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Хуудасны хэмжээ бүхэл тоо байна' })
  @Min(1, { message: 'Хуудасны хэмжээ 1-ээс багагүй' })
  @Max(100, { message: 'Хуудасны хэмжээ 100-аас ихгүй' })
  limit?: number = 20;

  @ApiProperty({
    description: 'Элсэлтийн статус',
    enum: ['active', 'completed', 'cancelled', 'expired'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['active', 'completed', 'cancelled', 'expired'], {
    message: 'Статус active, completed, cancelled, expired-ийн аль нэг байна',
  })
  status?: string;
}
