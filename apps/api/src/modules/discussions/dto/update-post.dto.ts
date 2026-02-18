import { IsString, IsOptional, IsArray, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Хэлэлцүүлгийн нийтлэл шинэчлэх хүсэлтийн DTO.
 * Нийтлэлийн гарчиг, агуулга, таг зэргийг шинэчлэхэд ашиглана.
 */
export class UpdatePostDto {
  @ApiProperty({
    description: 'Нийтлэлийн гарчиг',
    example: 'React hooks хэрхэн ажилладаг вэ?',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Гарчиг тэмдэгт мөр байх ёстой' })
  @MaxLength(200, { message: 'Гарчиг хамгийн ихдээ 200 тэмдэгт байна' })
  title?: string;

  @ApiProperty({
    description: 'Нийтлэлийн агуулга (markdown)',
    example: 'useEffect hook-ийн тухай шинэчилсэн тайлбар',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Агуулга тэмдэгт мөр байх ёстой' })
  @MinLength(1, { message: 'Агуулга хоосон байж болохгүй' })
  content?: string;

  @ApiProperty({
    description: 'Нийтлэлийн агуулга (HTML)',
    example: '<p>useEffect hook-ийн тухай шинэчилсэн тайлбар</p>',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'HTML агуулга тэмдэгт мөр байх ёстой' })
  @MinLength(1, { message: 'HTML агуулга хоосон байж болохгүй' })
  contentHtml?: string;

  @ApiProperty({
    description: 'Таг-ууд',
    example: ['react', 'hooks'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Таг-ууд массив байх ёстой' })
  @IsString({ each: true, message: 'Таг бүр тэмдэгт мөр байх ёстой' })
  tags?: string[];
}
