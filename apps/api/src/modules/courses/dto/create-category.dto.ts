import { IsString, IsOptional, IsInt, Min, MaxLength, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * Ангилал үүсгэх хүсэлтийн DTO.
 * Зөвхөн админ ангилал үүсгэнэ.
 */
export class CreateCategoryDto {
  @ApiProperty({ description: 'Ангиллын нэр', example: 'Веб хөгжүүлэлт' })
  @IsString({ message: 'Нэр тэмдэгт мөр байх ёстой' })
  @IsNotEmpty({ message: 'Нэр хоосон байж болохгүй' })
  @MaxLength(100, { message: 'Нэр хамгийн ихдээ 100 тэмдэгт байна' })
  name!: string;

  @ApiProperty({ description: 'Тайлбар', required: false })
  @IsOptional()
  @IsString({ message: 'Тайлбар тэмдэгт мөр байх ёстой' })
  @MaxLength(500, { message: 'Тайлбар хамгийн ихдээ 500 тэмдэгт байна' })
  description?: string;

  @ApiProperty({ description: 'Эцэг ангиллын ID (дэд ангилал бол)', required: false })
  @IsOptional()
  @IsUUID('4', { message: 'Эцэг ангиллын ID UUID формат байх ёстой' })
  parentId?: string;

  @ApiProperty({ description: 'Эрэмбэлэх дугаар', example: 0, required: false, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Эрэмбэлэх дугаар бүхэл тоо байх ёстой' })
  @Min(0, { message: 'Эрэмбэлэх дугаар 0-ээс бага байж болохгүй' })
  displayOrder?: number;
}
