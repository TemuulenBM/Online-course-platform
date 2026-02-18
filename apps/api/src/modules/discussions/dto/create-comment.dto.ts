import { IsString, IsUUID, IsOptional, IsNumber, Min, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Хичээлийн сэтгэгдэл үүсгэх хүсэлтийн DTO.
 * Хичээлийн тодорхой цэг дээр сэтгэгдэл бичихэд ашиглана.
 */
export class CreateCommentDto {
  @ApiProperty({
    description: 'Хичээлийн ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4', { message: 'Хичээлийн ID UUID формат байх ёстой' })
  lessonId!: string;

  @ApiProperty({
    description: 'Сэтгэгдлийн агуулга',
    example: 'Энэ хэсгийг илүү дэлгэрэнгүй тайлбарлана уу',
  })
  @IsString({ message: 'Агуулга тэмдэгт мөр байх ёстой' })
  @MinLength(1, { message: 'Агуулга хоосон байж болохгүй' })
  content!: string;

  @ApiProperty({
    description: 'Видеоны цагийн тэмдэглэл (секундээр)',
    example: 120,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Цагийн тэмдэглэл тоо байх ёстой' })
  @Min(0, { message: 'Цагийн тэмдэглэл 0-ээс бага байж болохгүй' })
  timestampSeconds?: number;
}
