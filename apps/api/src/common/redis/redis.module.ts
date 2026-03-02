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
        // REDIS_URL байвал Node.js URL class-аар parse хийж host/port/password авна
        // ioredis нь rediss:// URL-г шууд string-ээр хүлээн авдаггүй тул parse хийх шаардлагатай
        const redisUrl = configService.get<string>('redis.url');
        let redisOptions: ConstructorParameters<typeof Redis>[0];
        if (redisUrl) {
          const parsed = new URL(redisUrl);
          redisOptions = {
            host: parsed.hostname,
            port: parseInt(parsed.port || '6379', 10),
            password: parsed.password || undefined,
            // rediss:// схем бол TLS идэвхжүүлнэ (Upstash TLS)
            tls: parsed.protocol === 'rediss:' ? {} : undefined,
            lazyConnect: true,
          };
        } else {
          redisOptions = {
            host: configService.get<string>('redis.host'),
            port: configService.get<number>('redis.port'),
            password: configService.get<string>('redis.password'),
            tls: configService.get('redis.tls'),
            lazyConnect: true,
          };
        }
        const client = new Redis(redisOptions);

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
