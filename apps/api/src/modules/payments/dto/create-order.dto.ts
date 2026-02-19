import { IsUUID, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Захиалга үүсгэх DTO */
export class CreateOrderDto {
  @ApiProperty({ description: 'Сургалтын ID' })
  @IsUUID('4')
  courseId!: string;

  @ApiPropertyOptional({ description: 'Төлбөрийн арга (жишээ: bank_transfer)' })
  @IsOptional()
  @IsString()
  paymentMethod?: string;
}
