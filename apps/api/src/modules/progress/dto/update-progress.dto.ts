import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * Хичээлийн ахиц шинэчлэх DTO.
 */
export class UpdateProgressDto {
  @ApiPropertyOptional({
    description: 'Ахицын хувь (0-100)',
    example: 50,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Ахицын хувь бүхэл тоо байх ёстой' })
  @Min(0, { message: 'Ахицын хувь 0-ээс багагүй байх ёстой' })
  @Max(100, { message: 'Ахицын хувь 100-аас ихгүй байх ёстой' })
  progressPercentage?: number;

  @ApiPropertyOptional({
    description: 'Зарцуулсан хугацаа (секундээр)',
    example: 120,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Зарцуулсан хугацаа бүхэл тоо байх ёстой' })
  @Min(0, { message: 'Зарцуулсан хугацаа 0-ээс багагүй байх ёстой' })
  timeSpentSeconds?: number;

  @ApiPropertyOptional({
    description: 'Видеоны байрлал (секундээр)',
    example: 300,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Видеоны байрлал бүхэл тоо байх ёстой' })
  @Min(0, { message: 'Видеоны байрлал 0-ээс багагүй байх ёстой' })
  lastPositionSeconds?: number;
}
