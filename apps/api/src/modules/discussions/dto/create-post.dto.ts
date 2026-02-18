import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsArray,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Хэлэлцүүлгийн нийтлэл үүсгэх хүсэлтийн DTO.
 * Хэрэглэгч шинэ асуулт эсвэл хэлэлцүүлэг нийтлэхэд ашиглана.
 */
export class CreatePostDto {
  @ApiProperty({
    description: 'Сургалтын ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4', { message: 'Сургалтын ID UUID формат байх ёстой' })
  courseId!: string;

  @ApiProperty({
    description: 'Хичээлийн ID (заавал биш)',
    example: '550e8400-e29b-41d4-a716-446655440001',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'Хичээлийн ID UUID формат байх ёстой' })
  lessonId?: string;

  @ApiProperty({
    description: 'Нийтлэлийн төрөл',
    enum: ['question', 'discussion'],
    example: 'question',
  })
  @IsEnum(['question', 'discussion'], {
    message: 'Нийтлэлийн төрөл question эсвэл discussion байх ёстой',
  })
  postType!: string;

  @ApiProperty({
    description: 'Нийтлэлийн гарчиг (заавал биш)',
    example: 'React hooks хэрхэн ажилладаг вэ?',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Гарчиг тэмдэгт мөр байх ёстой' })
  @MaxLength(200, { message: 'Гарчиг хамгийн ихдээ 200 тэмдэгт байна' })
  title?: string;

  @ApiProperty({
    description: 'Нийтлэлийн агуулга (markdown)',
    example: 'useEffect hook-ийн тухай дэлгэрэнгүй тайлбарлана уу',
  })
  @IsString({ message: 'Агуулга тэмдэгт мөр байх ёстой' })
  @MinLength(1, { message: 'Агуулга хоосон байж болохгүй' })
  content!: string;

  @ApiProperty({
    description: 'Нийтлэлийн агуулга (HTML)',
    example: '<p>useEffect hook-ийн тухай дэлгэрэнгүй тайлбарлана уу</p>',
  })
  @IsString({ message: 'HTML агуулга тэмдэгт мөр байх ёстой' })
  @MinLength(1, { message: 'HTML агуулга хоосон байж болохгүй' })
  contentHtml!: string;

  @ApiProperty({
    description: 'Таг-ууд',
    example: ['react', 'hooks', 'useEffect'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Таг-ууд массив байх ёстой' })
  @IsString({ each: true, message: 'Таг бүр тэмдэгт мөр байх ёстой' })
  tags?: string[];
}
