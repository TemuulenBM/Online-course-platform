import { Injectable, Inject, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';

/** Redis кэш үйлчилгээний токен */
export const REDIS_CLIENT = 'REDIS_CLIENT';

/**
 * Redis сервис — кэшлэх, устгах үйлдлүүдийн wrapper.
 * JSON serialize/deserialize хийж, TTL дэмжлэгтэй.
 */
@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);

  constructor(@Inject(REDIS_CLIENT) private readonly client: Redis) {}

  /** Түлхүүрээр утга авах (JSON parse хийнэ) */
  async get<T = unknown>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as T;
    }
  }

  /** Түлхүүрт утга хадгалах (JSON stringify хийнэ, TTL секундээр) */
  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    if (ttlSeconds) {
      await this.client.set(key, serialized, 'EX', ttlSeconds);
    } else {
      await this.client.set(key, serialized);
    }
  }

  /** Түлхүүр устгах */
  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async onModuleDestroy() {
    await this.client.quit();
    this.logger.log('Redis холболт салгагдлаа');
  }
}
