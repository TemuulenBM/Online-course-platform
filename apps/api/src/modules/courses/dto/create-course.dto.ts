import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsArray,
  MaxLength,
  Min,
  IsNotEmpty,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Сургалт үүсгэх хүсэлтийн DTO.
 * Багш эсвэл админ шинэ сургалт үүсгэхэд ашиглана.
 */
export class CreateCourseDto {
  @ApiProperty({ description: 'Сургалтын нэр', example: 'React хөгжүүлэлтийн суурь' })
  @IsString({ message: 'Нэр тэмдэгт мөр байх ёстой' })
  @IsNotEmpty({ message: 'Нэр хоосон байж болохгүй' })
  @MaxLength(200, { message: 'Нэр хамгийн ихдээ 200 тэмдэгт байна' })
  title!: string;

  @ApiProperty({ description: 'Тайлбар', example: 'React-ийн суурь ойлголтуудыг сурах сургалт' })
  @IsString({ message: 'Тайлбар тэмдэгт мөр байх ёстой' })
  @IsNotEmpty({ message: 'Тайлбар хоосон байж болохгүй' })
  description!: string;

  @ApiProperty({ description: 'Ангиллын ID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID('4', { message: 'Ангиллын ID UUID формат байх ёстой' })
  categoryId!: string;

  @ApiProperty({ description: 'Үнэ (₮)', example: 49900, required: false })
  @IsOptional()
  @IsNumber({}, { message: 'Үнэ тоо байх ёстой' })
  @Min(0, { message: 'Үнэ 0-ээс бага байж болохгүй' })
  price?: number;

  @ApiProperty({
    description: 'Хүндийн зэрэг',
    enum: ['beginner', 'intermediate', 'advanced'],
    example: 'beginner',
  })
  @IsEnum(['beginner', 'intermediate', 'advanced'], {
    message: 'Хүндийн зэрэг beginner, intermediate, advanced-ийн аль нэг байх ёстой',
  })
  difficulty!: string;

  @ApiProperty({ description: 'Хэл', example: 'mn', required: false, default: 'en' })
  @IsOptional()
  @IsString({ message: 'Хэл тэмдэгт мөр байх ёстой' })
  language?: string;

  @ApiProperty({
    description: 'Таг-ууд',
    example: ['react', 'javascript', 'frontend'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Таг-ууд массив байх ёстой' })
  @IsString({ each: true, message: 'Таг бүр тэмдэгт мөр байх ёстой' })
  tags?: string[];
}
