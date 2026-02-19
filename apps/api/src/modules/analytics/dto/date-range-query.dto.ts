import { IsOptional, IsIn, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/** Хугацааны бүлэглэлтэй тайлангийн query DTO */
export class DateRangeQueryDto {
  @ApiPropertyOptional({
    description: 'Бүлэглэх хугацаа (day, month, year)',
    default: 'month',
  })
  @IsOptional()
  @IsIn(['day', 'month', 'year'])
  period?: 'day' | 'month' | 'year' = 'month';

  @ApiPropertyOptional({ description: 'Эхлэх огноо (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ description: 'Дуусах огноо (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
