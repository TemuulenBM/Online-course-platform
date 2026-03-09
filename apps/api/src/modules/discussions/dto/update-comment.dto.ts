import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Сэтгэгдэл шинэчлэх хүсэлтийн DTO.
 * Хичээлийн сэтгэгдлийн агуулгыг засварлахад ашиглана.
 */
export class UpdateCommentDto {
  @ApiProperty({
    description: 'Сэтгэгдлийн агуулга',
    example: 'Энэ хэсгийг илүү дэлгэрэнгүй тайлбарлана уу',
  })
  @IsString({ message: 'Агуулга тэмдэгт мөр байх ёстой' })
  @MinLength(1, { message: 'Агуулга хоосон байж болохгүй' })
  @MaxLength(10000, { message: 'Агуулга хамгийн ихдээ 10,000 тэмдэгт байна' })
  content!: string;
}
