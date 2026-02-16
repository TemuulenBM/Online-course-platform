import { IsOptional, IsInt, Min, Max, IsEnum, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * Сургалтуудын жагсаалтын query DTO.
 * Pagination, шүүлтүүр, хайлт дэмжинэ.
 */
export class ListCoursesQueryDto {
  @ApiProperty({ description: 'Хуудасны дугаар', example: 1, required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Хуудасны дугаар бүхэл тоо байх ёстой' })
  @Min(1, { message: 'Хуудасны дугаар хамгийн багадаа 1 байна' })
  page?: number = 1;

  @ApiProperty({ description: 'Хуудас бүрийн тоо', example: 20, required: false, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Хуудас бүрийн тоо бүхэл тоо байх ёстой' })
  @Min(1, { message: 'Хуудас бүрийн тоо хамгийн багадаа 1 байна' })
  @Max(100, { message: 'Хуудас бүрийн тоо хамгийн ихдээ 100 байна' })
  limit?: number = 20;

  @ApiProperty({
    description: 'Статусаар шүүх',
    enum: ['draft', 'published', 'archived'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['draft', 'published', 'archived'], {
    message: 'Статус draft, published, archived-ийн аль нэг байх ёстой',
  })
  status?: string;

  @ApiProperty({
    description: 'Хүндийн зэргээр шүүх',
    enum: ['beginner', 'intermediate', 'advanced'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['beginner', 'intermediate', 'advanced'], {
    message: 'Хүндийн зэрэг beginner, intermediate, advanced-ийн аль нэг байх ёстой',
  })
  difficulty?: string;

  @ApiProperty({ description: 'Ангиллын ID-аар шүүх', required: false })
  @IsOptional()
  @IsUUID('4', { message: 'Ангиллын ID UUID формат байх ёстой' })
  categoryId?: string;

  @ApiProperty({ description: 'Багшийн ID-аар шүүх', required: false })
  @IsOptional()
  @IsUUID('4', { message: 'Багшийн ID UUID формат байх ёстой' })
  instructorId?: string;

  @ApiProperty({ description: 'Нэрээр хайх', required: false })
  @IsOptional()
  @IsString({ message: 'Хайлтын утга тэмдэгт мөр байх ёстой' })
  search?: string;
}
