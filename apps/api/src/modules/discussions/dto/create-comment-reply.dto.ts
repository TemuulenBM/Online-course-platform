import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Сэтгэгдэлд хариулт бичих хүсэлтийн DTO.
 * Хичээлийн сэтгэгдэлд хариулт өгөхөд ашиглана.
 */
export class CreateCommentReplyDto {
  @ApiProperty({
    description: 'Хариултын агуулга',
    example: 'Тийм ээ, энэ хэсгийг дахин тайлбарлая',
  })
  @IsString({ message: 'Агуулга тэмдэгт мөр байх ёстой' })
  @MinLength(1, { message: 'Агуулга хоосон байж болохгүй' })
  content!: string;
}
