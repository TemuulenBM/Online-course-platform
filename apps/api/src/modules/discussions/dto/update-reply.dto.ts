import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Хариулт шинэчлэх хүсэлтийн DTO.
 * Хэлэлцүүлгийн хариултын агуулгыг засварлахад ашиглана.
 */
export class UpdateReplyDto {
  @ApiProperty({
    description: 'Хариултын агуулга (markdown)',
    example: 'useEffect-ийн dependency array хоосон байвал зөвхөн нэг удаа ажиллана',
  })
  @IsString({ message: 'Агуулга тэмдэгт мөр байх ёстой' })
  @MinLength(1, { message: 'Агуулга хоосон байж болохгүй' })
  @MaxLength(50000, { message: 'Агуулга хамгийн ихдээ 50,000 тэмдэгт байна' })
  content!: string;

  @ApiProperty({
    description: 'Хариултын агуулга (HTML)',
    example: '<p>useEffect-ийн dependency array хоосон байвал зөвхөн нэг удаа ажиллана</p>',
  })
  @IsString({ message: 'HTML агуулга тэмдэгт мөр байх ёстой' })
  @MinLength(1, { message: 'HTML агуулга хоосон байж болохгүй' })
  @MaxLength(100000, { message: 'HTML агуулга хамгийн ихдээ 100,000 тэмдэгт байна' })
  contentHtml!: string;
}
