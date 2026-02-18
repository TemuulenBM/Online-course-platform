import { IsString, IsOptional, IsInt, IsBoolean, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * Quiz үүсгэх DTO.
 */
export class CreateQuizDto {
  @ApiProperty({ description: 'Хичээлийн ID', example: 'uuid-lesson-id' })
  @IsString({ message: 'Хичээлийн ID тэмдэгт мөр байх ёстой' })
  lessonId!: string;

  @ApiProperty({ description: 'Quiz-ийн нэр', example: 'React Hooks шалгалт' })
  @IsString({ message: 'Quiz-ийн нэр тэмдэгт мөр байх ёстой' })
  title!: string;

  @ApiPropertyOptional({ description: 'Тайлбар', example: 'React Hooks-ийн мэдлэг шалгах quiz' })
  @IsOptional()
  @IsString({ message: 'Тайлбар тэмдэгт мөр байх ёстой' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Хугацааны хязгаар (минутаар, null=хязгааргүй)',
    example: 30,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Хугацааны хязгаар бүхэл тоо байх ёстой' })
  @Min(1, { message: 'Хугацааны хязгаар 1-ээс багагүй байх ёстой' })
  timeLimitMinutes?: number;

  @ApiPropertyOptional({
    description: 'Тэнцэх оноо (хувиар)',
    example: 70,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Тэнцэх оноо бүхэл тоо байх ёстой' })
  @Min(1, { message: 'Тэнцэх оноо 1-ээс багагүй байх ёстой' })
  @Max(100, { message: 'Тэнцэх оноо 100-аас ихгүй байх ёстой' })
  passingScorePercentage?: number;

  @ApiPropertyOptional({ description: 'Асуултуудыг санамсаргүй эрэмбэлэх', example: false })
  @IsOptional()
  @IsBoolean({ message: 'randomizeQuestions boolean байх ёстой' })
  randomizeQuestions?: boolean;

  @ApiPropertyOptional({
    description: 'Хариултын сонголтуудыг санамсаргүй эрэмбэлэх',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'randomizeOptions boolean байх ёстой' })
  randomizeOptions?: boolean;

  @ApiPropertyOptional({
    description: 'Дахин оролдлогын хязгаар (null=хязгааргүй)',
    example: 3,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Дахин оролдлогын хязгаар бүхэл тоо байх ёстой' })
  @Min(1, { message: 'Дахин оролдлогын хязгаар 1-ээс багагүй байх ёстой' })
  maxAttempts?: number;
}
