import { IsString, IsOptional, IsObject, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Профайл шинэчлэх хүсэлтийн DTO.
 * Бүх талбарууд optional — зөвхөн өөрчлөгдсөн талбаруудыг илгээнэ.
 */
export class UpdateUserProfileDto {
  @ApiProperty({ description: 'Нэр', example: 'Бат', required: false })
  @IsString({ message: 'Нэр тэмдэгт мөр байх ёстой' })
  @IsOptional()
  @MaxLength(100, { message: 'Нэр хамгийн ихдээ 100 тэмдэгт байна' })
  firstName?: string;

  @ApiProperty({ description: 'Овог', example: 'Дорж', required: false })
  @IsString({ message: 'Овог тэмдэгт мөр байх ёстой' })
  @IsOptional()
  @MaxLength(100, { message: 'Овог хамгийн ихдээ 100 тэмдэгт байна' })
  lastName?: string;

  @ApiProperty({ description: 'Намтар', example: 'Програм хангамжийн инженер', required: false })
  @IsString({ message: 'Намтар тэмдэгт мөр байх ёстой' })
  @IsOptional()
  @MaxLength(1000, { message: 'Намтар хамгийн ихдээ 1000 тэмдэгт байна' })
  bio?: string;

  @ApiProperty({ description: 'Улс', example: 'Mongolia', required: false })
  @IsString({ message: 'Улс тэмдэгт мөр байх ёстой' })
  @IsOptional()
  @MaxLength(100, { message: 'Улс хамгийн ихдээ 100 тэмдэгт байна' })
  country?: string;

  @ApiProperty({ description: 'Цагийн бүс', example: 'Asia/Ulaanbaatar', required: false })
  @IsString({ message: 'Цагийн бүс тэмдэгт мөр байх ёстой' })
  @IsOptional()
  @MaxLength(50, { message: 'Цагийн бүс хамгийн ихдээ 50 тэмдэгт байна' })
  timezone?: string;

  @ApiProperty({ description: 'Хэрэглэгчийн сонголтууд', example: { language: 'mn', theme: 'dark' }, required: false })
  @IsObject({ message: 'Сонголтууд объект байх ёстой' })
  @IsOptional()
  preferences?: Record<string, unknown>;
}
