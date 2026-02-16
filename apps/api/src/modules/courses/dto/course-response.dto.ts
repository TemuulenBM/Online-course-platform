import { ApiProperty } from '@nestjs/swagger';

/**
 * Сургалтын response DTO.
 * Swagger баримтжуулалтад ашиглана.
 */
export class CourseResponseDto {
  @ApiProperty({ description: 'Сургалтын ID' })
  id!: string;

  @ApiProperty({ description: 'Нэр' })
  title!: string;

  @ApiProperty({ description: 'Slug (URL-д ашиглах)' })
  slug!: string;

  @ApiProperty({ description: 'Тайлбар' })
  description!: string;

  @ApiProperty({ description: 'Багшийн ID' })
  instructorId!: string;

  @ApiProperty({ description: 'Ангиллын ID' })
  categoryId!: string;

  @ApiProperty({ description: 'Үнэ', nullable: true })
  price!: number | null;

  @ApiProperty({ description: 'Хямдралтай үнэ', nullable: true })
  discountPrice!: number | null;

  @ApiProperty({ description: 'Хүндийн зэрэг', enum: ['beginner', 'intermediate', 'advanced'] })
  difficulty!: string;

  @ApiProperty({ description: 'Хэл' })
  language!: string;

  @ApiProperty({ description: 'Статус', enum: ['draft', 'published', 'archived'] })
  status!: string;

  @ApiProperty({ description: 'Нүүр зургийн URL', nullable: true })
  thumbnailUrl!: string | null;

  @ApiProperty({ description: 'Нийт хугацаа (минутаар)' })
  durationMinutes!: number;

  @ApiProperty({ description: 'Нийтлэгдсэн огноо', nullable: true })
  publishedAt!: Date | null;

  @ApiProperty({ description: 'Үүсгэсэн огноо' })
  createdAt!: Date;

  @ApiProperty({ description: 'Шинэчилсэн огноо' })
  updatedAt!: Date;

  @ApiProperty({ description: 'Таг-ууд', type: [String], required: false })
  tags?: string[];

  @ApiProperty({ description: 'Багшийн нэр', required: false })
  instructorName?: string;

  @ApiProperty({ description: 'Ангиллын нэр', required: false })
  categoryName?: string;
}
