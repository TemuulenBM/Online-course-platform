import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsOptional,
  IsInt,
  Min,
} from 'class-validator';

/** Видео контент тавих DTO */
export class SetVideoContentDto {
  @ApiProperty({ description: 'Хичээлийн ID (PostgreSQL)', example: 'uuid-v4' })
  @IsUUID('4')
  lessonId!: string;

  @ApiPropertyOptional({
    description: 'Видео файлын URL',
    example: 'https://r2.example.com/videos/lesson-1.mp4',
  })
  @IsOptional()
  @IsString()
  videoUrl?: string;

  @ApiPropertyOptional({
    description: 'Видео зургийн URL',
    example: 'https://r2.example.com/thumbnails/lesson-1.jpg',
  })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @ApiPropertyOptional({
    description: 'Видеоны үргэлжлэх хугацаа (секунд)',
    example: 1200,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  durationSeconds?: number;
}
