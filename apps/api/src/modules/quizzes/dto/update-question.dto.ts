import { PartialType } from '@nestjs/swagger';
import { AddQuestionDto } from './add-question.dto';

/**
 * Асуулт шинэчлэх DTO.
 * AddQuestionDto-ийн бүх field-ийг optional болгосон.
 */
export class UpdateQuestionDto extends PartialType(AddQuestionDto) {}
