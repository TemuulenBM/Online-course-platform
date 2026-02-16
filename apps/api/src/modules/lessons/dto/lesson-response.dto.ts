import { ApiProperty } from '@nestjs/swagger';

/**
 * Хичээлийн response DTO.
 * Swagger баримтжуулалтад ашиглана.
 */
export class LessonResponseDto {
  @ApiProperty({ description: 'Хичээлийн ID' })
  id!: string;

  @ApiProperty({ description: 'Сургалтын ID' })
  courseId!: string;

  @ApiProperty({ description: 'Нэр' })
  title!: string;

  @ApiProperty({ description: 'Дарааллын индекс' })
  orderIndex!: number;

  @ApiProperty({
    description: 'Хичээлийн төрөл',
    enum: ['video', 'text', 'quiz', 'assignment', 'live'],
  })
  lessonType!: string;

  @ApiProperty({ description: 'Үргэлжлэх хугацаа (минутаар)' })
  durationMinutes!: number;

  @ApiProperty({ description: 'Үнэгүй preview эсэх' })
  isPreview!: boolean;

  @ApiProperty({ description: 'Нийтлэгдсэн эсэх' })
  isPublished!: boolean;

  @ApiProperty({ description: 'Үүсгэсэн огноо' })
  createdAt!: Date;

  @ApiProperty({ description: 'Шинэчилсэн огноо' })
  updatedAt!: Date;

  @ApiProperty({ description: 'Сургалтын нэр', required: false })
  courseTitle?: string;
}
