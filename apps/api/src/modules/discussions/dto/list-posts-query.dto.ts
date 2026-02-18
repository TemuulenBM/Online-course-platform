import { IsOptional, IsInt, Min, Max, IsEnum, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * Хэлэлцүүлгийн нийтлэлүүдийн жагсаалтын query DTO.
 * Pagination, шүүлтүүр, хайлт, эрэмбэлэлт дэмжинэ.
 */
export class ListPostsQueryDto {
  @ApiProperty({
    description: 'Хуудасны дугаар',
    example: 1,
    required: false,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Хуудасны дугаар бүхэл тоо байх ёстой' })
  @Min(1, { message: 'Хуудасны дугаар хамгийн багадаа 1 байна' })
  page?: number = 1;

  @ApiProperty({
    description: 'Хуудас бүрийн тоо',
    example: 20,
    required: false,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Хуудас бүрийн тоо бүхэл тоо байх ёстой' })
  @Min(1, { message: 'Хуудас бүрийн тоо хамгийн багадаа 1 байна' })
  @Max(100, { message: 'Хуудас бүрийн тоо хамгийн ихдээ 100 байна' })
  limit?: number = 20;

  @ApiProperty({
    description: 'Нийтлэлийн төрлөөр шүүх',
    enum: ['question', 'discussion'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['question', 'discussion'], {
    message: 'Нийтлэлийн төрөл question эсвэл discussion байх ёстой',
  })
  postType?: string;

  @ApiProperty({
    description: 'Нэрээр хайх',
    example: 'useEffect',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Хайлтын утга тэмдэгт мөр байх ёстой' })
  search?: string;

  @ApiProperty({
    description: 'Таг-уудаар шүүх (таслалаар тусгаарлагдсан)',
    example: 'react,hooks',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Таг-ууд тэмдэгт мөр байх ёстой' })
  tags?: string;

  @ApiProperty({
    description: 'Эрэмбэлэх',
    enum: ['newest', 'votes', 'views'],
    required: false,
    default: 'newest',
  })
  @IsOptional()
  @IsEnum(['newest', 'votes', 'views'], {
    message: 'Эрэмбэлэлт newest, votes, views-ийн аль нэг байх ёстой',
  })
  sortBy?: 'newest' | 'votes' | 'views' = 'newest';
}
