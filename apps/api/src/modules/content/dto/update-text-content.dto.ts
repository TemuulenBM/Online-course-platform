import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, Min } from 'class-validator';

/** Текст контент шинэчлэх DTO (бүх талбар optional) */
export class UpdateTextContentDto {
  @ApiPropertyOptional({
    description: 'HTML форматтай текст контент',
    example: '<h1>Шинэчлэгдсэн контент</h1>',
  })
  @IsOptional()
  @IsString()
  html?: string;

  @ApiPropertyOptional({
    description: 'Markdown форматтай текст контент',
    example: '# Шинэчлэгдсэн контент',
  })
  @IsOptional()
  @IsString()
  markdown?: string;

  @ApiPropertyOptional({
    description: 'Уншихад зарцуулагдах хугацаа (минут)',
    example: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  readingTimeMinutes?: number;
}
