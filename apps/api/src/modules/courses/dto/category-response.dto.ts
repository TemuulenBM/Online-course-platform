import { ApiProperty } from '@nestjs/swagger';

/**
 * Ангиллын response DTO.
 * Swagger баримтжуулалтад ашиглана.
 */
export class CategoryResponseDto {
  @ApiProperty({ description: 'Ангиллын ID' })
  id!: string;

  @ApiProperty({ description: 'Нэр' })
  name!: string;

  @ApiProperty({ description: 'Slug (URL-д ашиглах)' })
  slug!: string;

  @ApiProperty({ description: 'Тайлбар', nullable: true })
  description!: string | null;

  @ApiProperty({ description: 'Эцэг ангиллын ID', nullable: true })
  parentId!: string | null;

  @ApiProperty({ description: 'Эрэмбэлэх дугаар' })
  displayOrder!: number;

  @ApiProperty({ description: 'Үүсгэсэн огноо' })
  createdAt!: Date;

  @ApiProperty({ description: 'Шинэчилсэн огноо' })
  updatedAt!: Date;

  @ApiProperty({ description: 'Дэд ангиллууд', type: [CategoryResponseDto], required: false })
  children?: CategoryResponseDto[];

  @ApiProperty({ description: 'Сургалтуудын тоо', required: false })
  coursesCount?: number;
}
