import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsEnum,
  IsOptional,
  IsInt,
  IsBoolean,
  IsUUID,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Хичээл үүсгэх хүсэлтийн DTO.
 * Багш эсвэл админ шинэ хичээл үүсгэхэд ашиглана.
 */
export class CreateLessonDto {
  @ApiProperty({ description: 'Хичээлийн нэр', example: 'React-ийн суурь ойлголтууд' })
  @IsString({ message: 'Нэр тэмдэгт мөр байх ёстой' })
  @IsNotEmpty({ message: 'Нэр хоосон байж болохгүй' })
  @MaxLength(300, { message: 'Нэр хамгийн ихдээ 300 тэмдэгт байна' })
  title!: string;

  @ApiProperty({
    description: 'Сургалтын ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4', { message: 'Сургалтын ID UUID формат байх ёстой' })
  courseId!: string;

  @ApiProperty({
    description: 'Хичээлийн төрөл',
    enum: ['video', 'text', 'quiz', 'assignment', 'live'],
    example: 'video',
  })
  @IsEnum(['video', 'text', 'quiz', 'assignment', 'live'], {
    message: 'Хичээлийн төрөл video, text, quiz, assignment, live-ийн аль нэг байх ёстой',
  })
  lessonType!: string;

  @ApiProperty({
    description: 'Хичээлийн үргэлжлэх хугацаа (минутаар)',
    example: 30,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'Хугацаа бүхэл тоо байх ёстой' })
  @Min(0, { message: 'Хугацаа 0-ээс бага байж болохгүй' })
  durationMinutes?: number;

  @ApiProperty({
    description: 'Үнэгүй preview эсэх',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Preview утга boolean байх ёстой' })
  isPreview?: boolean;

  @ApiProperty({
    description: 'Нийтлэгдсэн эсэх',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Нийтлэгдсэн утга boolean байх ёстой' })
  isPublished?: boolean;
}
