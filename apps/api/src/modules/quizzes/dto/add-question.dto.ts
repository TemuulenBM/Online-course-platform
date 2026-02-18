import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  IsArray,
  IsEnum,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/** Сонголтын хариулт DTO */
export class QuestionOptionDto {
  @ApiProperty({ description: 'Сонголтын ID', example: 'a' })
  @IsString()
  optionId!: string;

  @ApiProperty({ description: 'Сонголтын текст', example: 'JavaScript library' })
  @IsString()
  text!: string;

  @ApiProperty({ description: 'Зөв хариулт эсэх', example: true })
  @IsBoolean()
  isCorrect!: boolean;
}

/** Тест тохиолдол DTO (code_challenge) */
export class TestCaseDto {
  @ApiProperty({ description: 'Оролтын утга', example: 'hello' })
  @IsString()
  input!: string;

  @ApiProperty({ description: 'Хүлээгдэж буй гаралт', example: 'olleh' })
  @IsString()
  expectedOutput!: string;
}

/** Дүгнэлтийн шалгуур DTO (essay) */
export class RubricCriterionDto {
  @ApiProperty({ description: 'Шалгуурын нэр', example: 'Ойлголт' })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'Оноо', example: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  points!: number;

  @ApiPropertyOptional({ description: 'Тайлбар' })
  @IsOptional()
  @IsString()
  description?: string;
}

/** Дүгнэлтийн загвар DTO (essay) */
export class RubricDto {
  @ApiProperty({ description: 'Шалгуурууд', type: [RubricCriterionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RubricCriterionDto)
  criteria!: RubricCriterionDto[];
}

/**
 * Асуулт нэмэх DTO.
 * Асуултын төрлөөс хамааран өөр өөр field-ууд шаардлагатай.
 */
export class AddQuestionDto {
  @ApiProperty({
    description: 'Асуултын төрөл',
    enum: ['multiple_choice', 'true_false', 'fill_blank', 'code_challenge', 'essay'],
  })
  @IsEnum(['multiple_choice', 'true_false', 'fill_blank', 'code_challenge', 'essay'], {
    message: 'Асуултын төрөл буруу байна',
  })
  type!: string;

  @ApiProperty({ description: 'Асуултын текст', example: 'React гэж юу вэ?' })
  @IsString({ message: 'Асуултын текст тэмдэгт мөр байх ёстой' })
  questionText!: string;

  @ApiProperty({ description: 'Оноо', example: 10, minimum: 1 })
  @Type(() => Number)
  @IsInt({ message: 'Оноо бүхэл тоо байх ёстой' })
  @Min(1, { message: 'Оноо 1-ээс багагүй байх ёстой' })
  points!: number;

  /** multiple_choice */
  @ApiPropertyOptional({
    description: 'Хариултын сонголтууд (multiple_choice)',
    type: [QuestionOptionDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionOptionDto)
  options?: QuestionOptionDto[];

  /** true_false */
  @ApiPropertyOptional({ description: 'Зөв хариулт (true_false)', example: true })
  @IsOptional()
  @IsBoolean({ message: 'correctAnswer boolean байх ёстой' })
  correctAnswer?: boolean;

  /** fill_blank */
  @ApiPropertyOptional({
    description: 'Зөв хариултууд (fill_blank)',
    example: ['Facebook', 'Meta'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  correctAnswers?: string[];

  @ApiPropertyOptional({ description: 'Том жижиг үсэг ялгах эсэх (fill_blank)', example: false })
  @IsOptional()
  @IsBoolean()
  caseSensitive?: boolean;

  /** code_challenge */
  @ApiPropertyOptional({ description: 'Програмчлалын хэл', example: 'javascript' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ description: 'Эхлэх код' })
  @IsOptional()
  @IsString()
  starterCode?: string;

  @ApiPropertyOptional({ description: 'Тест тохиолдлууд', type: [TestCaseDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestCaseDto)
  testCases?: TestCaseDto[];

  @ApiPropertyOptional({ description: 'Зөв шийдэл' })
  @IsOptional()
  @IsString()
  solution?: string;

  /** essay */
  @ApiPropertyOptional({ description: 'Хамгийн бага үгийн тоо', example: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  minWords?: number;

  @ApiPropertyOptional({ description: 'Хамгийн их үгийн тоо', example: 500 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  maxWords?: number;

  @ApiPropertyOptional({ description: 'Дүгнэлтийн загвар (essay)', type: RubricDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => RubricDto)
  rubric?: RubricDto;

  /** Нийтлэг */
  @ApiPropertyOptional({ description: 'Тайлбар (зөв хариултын тайлбар)' })
  @IsOptional()
  @IsString()
  explanation?: string;

  @ApiPropertyOptional({ description: 'Хүндрэлийн зэрэг', enum: ['easy', 'medium', 'hard'] })
  @IsOptional()
  @IsEnum(['easy', 'medium', 'hard'])
  difficulty?: string;

  @ApiPropertyOptional({ description: 'Шошго', example: ['react', 'hooks'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
