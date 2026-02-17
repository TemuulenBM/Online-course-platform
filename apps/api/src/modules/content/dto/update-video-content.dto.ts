import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, Min } from 'class-validator';

/** Видео контент шинэчлэх DTO (бүх талбар optional) */
export class UpdateVideoContentDto {
  @ApiPropertyOptional({
    description: 'Видео файлын URL',
    example: 'https://r2.example.com/videos/lesson-1-updated.mp4',
  })
  @IsOptional()
  @IsString()
  videoUrl?: string;

  @ApiPropertyOptional({
    description: 'Видео зургийн URL',
    example: 'https://r2.example.com/thumbnails/lesson-1-updated.jpg',
  })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @ApiPropertyOptional({
    description: 'Видеоны үргэлжлэх хугацаа (секунд)',
    example: 1500,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  durationSeconds?: number;
}
