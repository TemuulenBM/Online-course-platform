import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/** Дүгнэлтийн шалгуур оноо DTO */
export class RubricScoreDto {
  @ApiProperty({ description: 'Шалгуурын нэр', example: 'Ойлголт' })
  @IsString()
  criterion!: string;

  @ApiProperty({ description: 'Өгсөн оноо', example: 8 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  points!: number;
}

/**
 * Quiz хариулт гараар дүгнэх DTO (essay/code_challenge).
 */
export class GradeAttemptDto {
  @ApiProperty({ description: 'Асуултын ID' })
  @IsString({ message: 'Асуултын ID тэмдэгт мөр байх ёстой' })
  questionId!: string;

  @ApiProperty({ description: 'Өгсөн оноо', example: 15, minimum: 0 })
  @Type(() => Number)
  @IsInt({ message: 'Оноо бүхэл тоо байх ёстой' })
  @Min(0, { message: 'Оноо 0-ээс багагүй байх ёстой' })
  pointsEarned!: number;

  @ApiProperty({ description: 'Зөв хариулт гэж үзсэн эсэх', example: true })
  @IsBoolean({ message: 'isCorrect boolean байх ёстой' })
  isCorrect!: boolean;

  @ApiPropertyOptional({ description: 'Багшийн тайлбар', example: 'Маш сайн тайлбарлажээ' })
  @IsOptional()
  @IsString()
  feedback?: string;

  @ApiPropertyOptional({ description: 'Дүгнэлтийн шалгуурын оноо (essay)', type: [RubricScoreDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RubricScoreDto)
  rubricScores?: RubricScoreDto[];
}
