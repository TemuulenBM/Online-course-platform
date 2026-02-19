import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/** Захиалга баталгаажуулах DTO */
export class ApproveOrderDto {
  @ApiPropertyOptional({ description: 'Админы тэмдэглэл' })
  @IsOptional()
  @IsString()
  adminNote?: string;
}
