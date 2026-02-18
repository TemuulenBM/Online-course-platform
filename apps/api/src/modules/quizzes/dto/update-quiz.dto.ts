import { IsString, IsOptional, IsInt, IsBoolean, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * Quiz шинэчлэх DTO.
 */
export class UpdateQuizDto {
  @ApiPropertyOptional({
    description: 'Quiz-ийн нэр',
    example: 'React Hooks шалгалт (шинэчлэгдсэн)',
  })
  @IsOptional()
  @IsString({ message: 'Quiz-ийн нэр тэмдэгт мөр байх ёстой' })
  title?: string;

  @ApiPropertyOptional({ description: 'Тайлбар' })
  @IsOptional()
  @IsString({ message: 'Тайлбар тэмдэгт мөр байх ёстой' })
  description?: string;

  @ApiPropertyOptional({ description: 'Хугацааны хязгаар (минутаар, null=хязгааргүй)', minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Хугацааны хязгаар бүхэл тоо байх ёстой' })
  @Min(1, { message: 'Хугацааны хязгаар 1-ээс багагүй байх ёстой' })
  timeLimitMinutes?: number | null;

  @ApiPropertyOptional({ description: 'Тэнцэх оноо (хувиар)', minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Тэнцэх оноо бүхэл тоо байх ёстой' })
  @Min(1, { message: 'Тэнцэх оноо 1-ээс багагүй байх ёстой' })
  @Max(100, { message: 'Тэнцэх оноо 100-аас ихгүй байх ёстой' })
  passingScorePercentage?: number;

  @ApiPropertyOptional({ description: 'Асуултуудыг санамсаргүй эрэмбэлэх' })
  @IsOptional()
  @IsBoolean({ message: 'randomizeQuestions boolean байх ёстой' })
  randomizeQuestions?: boolean;

  @ApiPropertyOptional({ description: 'Хариултын сонголтуудыг санамсаргүй эрэмбэлэх' })
  @IsOptional()
  @IsBoolean({ message: 'randomizeOptions boolean байх ёстой' })
  randomizeOptions?: boolean;

  @ApiPropertyOptional({ description: 'Дахин оролдлогын хязгаар (null=хязгааргүй)', minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Дахин оролдлогын хязгаар бүхэл тоо байх ёстой' })
  @Min(1, { message: 'Дахин оролдлогын хязгаар 1-ээс багагүй байх ёстой' })
  maxAttempts?: number | null;
}
