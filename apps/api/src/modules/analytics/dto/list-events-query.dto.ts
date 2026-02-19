import { IsOptional, IsInt, Min, Max, IsString, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

/** Event жагсаалтын query DTO */
export class ListEventsQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Event нэрээр шүүх' })
  @IsOptional()
  @IsString()
  eventName?: string;

  @ApiPropertyOptional({ description: 'Event ангилалаар шүүх' })
  @IsOptional()
  @IsString()
  eventCategory?: string;

  @ApiPropertyOptional({ description: 'Хэрэглэгчийн ID-аар шүүх' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ description: 'Эхлэх огноо (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ description: 'Дуусах огноо (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
