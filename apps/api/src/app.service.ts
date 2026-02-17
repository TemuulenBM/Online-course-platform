import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './common/prisma/prisma.service';
import { RedisService } from './common/redis/redis.service';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

/**
 * Аппликейшний үндсэн сервис — health check endpoint-д ашиглана.
 * PostgreSQL, Redis, MongoDB холболтыг шалгаж, status буцаана.
 */
@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    @InjectConnection() private readonly mongoConnection: Connection,
  ) {}

  async getHealth() {
    const services: Record<string, string> = {};
    let allHealthy = true;

    // PostgreSQL шалгах
    try {
      await this.prisma.$queryRawUnsafe('SELECT 1');
      services.database = 'ok';
    } catch (error) {
      services.database = 'down';
      allHealthy = false;
      this.logger.error('PostgreSQL health check амжилтгүй', error);
    }

    // Redis шалгах
    try {
      await this.redis.set('health:check', 'ok', 10);
      services.redis = 'ok';
    } catch (error) {
      services.redis = 'down';
      allHealthy = false;
      this.logger.error('Redis health check амжилтгүй', error);
    }

    // MongoDB шалгах
    try {
      const state = this.mongoConnection.readyState;
      services.mongodb = state === 1 ? 'ok' : 'down';
      if (state !== 1) allHealthy = false;
    } catch (error) {
      services.mongodb = 'down';
      allHealthy = false;
      this.logger.error('MongoDB health check амжилтгүй', error);
    }

    return {
      status: allHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      services,
    };
  }
}
