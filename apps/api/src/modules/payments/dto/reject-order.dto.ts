import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/** Захиалга татгалзах DTO */
export class RejectOrderDto {
  @ApiProperty({ description: 'Татгалзах шалтгаан (заавал)' })
  @IsNotEmpty()
  @IsString()
  adminNote!: string;
}
