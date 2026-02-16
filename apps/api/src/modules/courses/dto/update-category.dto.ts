import { PartialType } from '@nestjs/swagger';
import { CreateCategoryDto } from './create-category.dto';

/**
 * Ангилал шинэчлэх хүсэлтийн DTO.
 * CreateCategoryDto-ийн бүх талбарууд optional.
 */
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
