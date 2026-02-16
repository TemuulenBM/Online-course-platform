import { PartialType } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateCourseDto } from './create-course.dto';

/**
 * Сургалт шинэчлэх хүсэлтийн DTO.
 * CreateCourseDto-ийн бүх талбарууд optional + нэмэлт талбарууд.
 */
export class UpdateCourseDto extends PartialType(CreateCourseDto) {
  @ApiProperty({ description: 'Хямдралтай үнэ (₮)', example: 29900, required: false })
  @IsOptional()
  @IsNumber({}, { message: 'Хямдралтай үнэ тоо байх ёстой' })
  @Min(0, { message: 'Хямдралтай үнэ 0-ээс бага байж болохгүй' })
  discountPrice?: number;

  @ApiProperty({ description: 'Нүүр зургийн URL', required: false })
  @IsOptional()
  @IsString({ message: 'Нүүр зургийн URL тэмдэгт мөр байх ёстой' })
  thumbnailUrl?: string;
}
