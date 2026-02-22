import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { RedisService } from '../../../../common/redis/redis.service';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

/** Системийн health шалгах use case */
@Injectable()
export class GetSystemHealthUseCase {
  private readonly logger = new Logger(GetSystemHealthUseCase.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
    @InjectConnection() private readonly mongoConnection: Connection,
  ) {}

  async execute() {
    const services: Record<string, { status: string; latencyMs?: number }> = {};

    /** PostgreSQL шалгах */
    try {
      const start = Date.now();
      await this.prisma.$queryRawUnsafe('SELECT 1');
      services.database = { status: 'ok', latencyMs: Date.now() - start };
    } catch {
      services.database = { status: 'error' };
    }

    /** Redis шалгах */
    try {
      const start = Date.now();
      await this.redisService.set('admin:health:check', 'ok', 10);
      await this.redisService.get('admin:health:check');
      services.redis = { status: 'ok', latencyMs: Date.now() - start };
    } catch {
      services.redis = { status: 'error' };
    }

    /** MongoDB шалгах */
    try {
      const readyState = this.mongoConnection.readyState;
      services.mongodb = {
        status: readyState === 1 ? 'ok' : 'error',
      };
    } catch {
      services.mongodb = { status: 'error' };
    }

    const allOk = Object.values(services).every((s) => s.status === 'ok');
    return {
      status: allOk ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      services,
    };
  }
}
