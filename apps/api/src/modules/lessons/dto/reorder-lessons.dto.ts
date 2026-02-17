import { IsArray, IsUUID, IsInt, Min, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Хичээлийн дарааллыг тодорхойлох дан элемент.
 */
export class LessonOrderItemDto {
  @ApiProperty({ description: 'Хичээлийн ID' })
  @IsUUID('4', { message: 'Хичээлийн ID UUID формат байх ёстой' })
  lessonId!: string;

  @ApiProperty({ description: 'Шинэ дарааллын индекс', example: 1 })
  @IsInt({ message: 'Дарааллын индекс бүхэл тоо байх ёстой' })
  @Min(0, { message: 'Дарааллын индекс 0-ээс бага байж болохгүй' })
  orderIndex!: number;
}

/**
 * Хичээлүүдийн дарааллыг өөрчлөх DTO.
 * Сургалтын хичээлүүдийн order_index-г нэг дор шинэчилнэ.
 */
export class ReorderLessonsDto {
  @ApiProperty({ description: 'Сургалтын ID' })
  @IsUUID('4', { message: 'Сургалтын ID UUID формат байх ёстой' })
  courseId!: string;

  @ApiProperty({
    description: 'Хичээлүүдийн шинэ дараалал',
    type: [LessonOrderItemDto],
  })
  @IsArray({ message: 'items массив байх ёстой' })
  @ArrayMinSize(1, {
    message: 'Хамгийн багадаа 1 хичээлийн дараалал шаардлагатай',
  })
  @ValidateNested({ each: true })
  @Type(() => LessonOrderItemDto)
  items!: LessonOrderItemDto[];
}
