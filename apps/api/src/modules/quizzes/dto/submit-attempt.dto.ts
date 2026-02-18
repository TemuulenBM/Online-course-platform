import {
  IsArray,
  ValidateNested,
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/** Хариултын өгөгдөл DTO */
export class AnswerDataDto {
  @ApiProperty({
    description: 'Хариултын төрөл',
    example: 'multiple_choice',
  })
  @IsString()
  type!: string;

  /** multiple_choice — сонгосон сонголт */
  @ApiPropertyOptional({ description: 'Сонгосон сонголтын ID', example: 'a' })
  @IsOptional()
  @IsString()
  selectedOption?: string;

  /** true_false — сонгосон хариулт */
  @ApiPropertyOptional({ description: 'Сонгосон хариулт (true/false)', example: true })
  @IsOptional()
  @IsBoolean()
  selectedAnswer?: boolean;

  /** fill_blank — бичсэн хариулт */
  @ApiPropertyOptional({ description: 'Бичсэн хариулт', example: 'Facebook' })
  @IsOptional()
  @IsString()
  filledAnswer?: string;

  /** code_challenge — илгээсэн код */
  @ApiPropertyOptional({ description: 'Илгээсэн код' })
  @IsOptional()
  @IsString()
  submittedCode?: string;

  /** essay — илгээсэн текст */
  @ApiPropertyOptional({ description: 'Илгээсэн текст' })
  @IsOptional()
  @IsString()
  submittedText?: string;

  /** Асуултанд зарцуулсан хугацаа (секунд) */
  @ApiPropertyOptional({ description: 'Зарцуулсан хугацаа (секунд)', example: 15 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  timeSpentSeconds?: number;
}

/** Нэг хариулт DTO */
export class AnswerItemDto {
  @ApiProperty({ description: 'Асуултын ID' })
  @IsString({ message: 'Асуултын ID тэмдэгт мөр байх ёстой' })
  questionId!: string;

  @ApiProperty({ description: 'Хариултын өгөгдөл', type: AnswerDataDto })
  @ValidateNested()
  @Type(() => AnswerDataDto)
  answerData!: AnswerDataDto;
}

/**
 * Quiz хариулт илгээх DTO.
 */
export class SubmitAttemptDto {
  @ApiProperty({ description: 'Хариултуудын жагсаалт', type: [AnswerItemDto] })
  @IsArray({ message: 'Хариултууд массив байх ёстой' })
  @ValidateNested({ each: true })
  @Type(() => AnswerItemDto)
  answers!: AnswerItemDto[];
}
