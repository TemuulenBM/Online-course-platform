import { IsInt, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * Видеоны байрлал шинэчлэх DTO.
 */
export class UpdateVideoPositionDto {
  @ApiProperty({
    description: 'Видеоны байрлал (секундээр)',
    example: 300,
    minimum: 0,
  })
  @Type(() => Number)
  @IsInt({ message: 'Видеоны байрлал бүхэл тоо байх ёстой' })
  @Min(0, { message: 'Видеоны байрлал 0-ээс багагүй байх ёстой' })
  lastPositionSeconds!: number;

  @ApiPropertyOptional({
    description: 'Зарцуулсан хугацаа (секундээр)',
    example: 60,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Зарцуулсан хугацаа бүхэл тоо байх ёстой' })
  @Min(0, { message: 'Зарцуулсан хугацаа 0-ээс багагүй байх ёстой' })
  timeSpentSeconds?: number;
}
