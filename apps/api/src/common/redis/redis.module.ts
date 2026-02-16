import { Global, Module, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { RedisService, REDIS_CLIENT } from './redis.service';

/**
 * Redis модуль — @Global() тул бүх модулиас шууд ашиглах боломжтой.
 * ioredis клиент болон RedisService-ийг хангана.
 */
@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: (configService: ConfigService) => {
        const logger = new Logger('RedisModule');
        const client = new Redis({
          host: configService.get<string>('redis.host'),
          port: configService.get<number>('redis.port'),
          password: configService.get<string>('redis.password'),
          lazyConnect: true,
        });

        client.on('connect', () => {
          logger.log('Redis-тэй амжилттай холбогдлоо');
        });

        client.on('error', (err) => {
          logger.error(`Redis холболтын алдаа: ${err.message}`);
        });

        client.connect().catch((err) => {
          logger.error(`Redis-тэй холбогдож чадсангүй: ${err.message}`);
        });

        return client;
      },
      inject: [ConfigService],
    },
    RedisService,
  ],
  exports: [RedisService],
})
export class RedisModule {}
