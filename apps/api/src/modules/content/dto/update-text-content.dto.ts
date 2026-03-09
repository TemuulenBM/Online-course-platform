import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, Min, MaxLength } from 'class-validator';

/** Текст контент шинэчлэх DTO (бүх талбар optional) */
export class UpdateTextContentDto {
  @ApiPropertyOptional({
    description: 'HTML форматтай текст контент',
    example: '<h1>Шинэчлэгдсэн контент</h1>',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500000, { message: 'HTML контент хамгийн ихдээ 500,000 тэмдэгт байна' })
  html?: string;

  @ApiPropertyOptional({
    description: 'Markdown форматтай текст контент',
    example: '# Шинэчлэгдсэн контент',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500000, { message: 'Markdown контент хамгийн ихдээ 500,000 тэмдэгт байна' })
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
