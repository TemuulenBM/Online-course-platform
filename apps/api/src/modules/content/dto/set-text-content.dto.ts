import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsInt,
  Min,
} from 'class-validator';

/** Текст контент тавих DTO */
export class SetTextContentDto {
  @ApiProperty({ description: 'Хичээлийн ID (PostgreSQL)', example: 'uuid-v4' })
  @IsUUID('4')
  lessonId!: string;

  @ApiProperty({
    description: 'HTML форматтай текст контент',
    example: '<h1>Танилцуулга</h1><p>Тавтай морил...</p>',
  })
  @IsString()
  @IsNotEmpty()
  html!: string;

  @ApiPropertyOptional({
    description: 'Markdown форматтай текст контент',
    example: '# Танилцуулга\n\nТавтай морил...',
  })
  @IsOptional()
  @IsString()
  markdown?: string;

  @ApiPropertyOptional({
    description: 'Уншихад зарцуулагдах хугацаа (минут)',
    example: 5,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  readingTimeMinutes?: number;
}
