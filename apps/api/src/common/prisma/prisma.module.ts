import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * Prisma модуль — @Global() тул бүх модулиас шууд ашиглах боломжтой.
 * PrismaService-ийг export хийж өгнө.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
