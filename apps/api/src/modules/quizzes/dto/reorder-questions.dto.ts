import { IsArray, ValidateNested, IsString, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/** Дарааллын элемент */
export class QuestionOrderItemDto {
  @ApiProperty({ description: 'Асуултын ID' })
  @IsString({ message: 'Асуултын ID тэмдэгт мөр байх ёстой' })
  questionId!: string;

  @ApiProperty({ description: 'Шинэ дараалал', example: 1, minimum: 0 })
  @Type(() => Number)
  @IsInt({ message: 'Дараалал бүхэл тоо байх ёстой' })
  @Min(0, { message: 'Дараалал 0-ээс багагүй байх ёстой' })
  orderIndex!: number;
}

/**
 * Асуултуудын дараалал солих DTO.
 */
export class ReorderQuestionsDto {
  @ApiProperty({ description: 'Асуултуудын шинэ дараалал', type: [QuestionOrderItemDto] })
  @IsArray({ message: 'Дараалал массив байх ёстой' })
  @ValidateNested({ each: true })
  @Type(() => QuestionOrderItemDto)
  questionOrder!: QuestionOrderItemDto[];
}
