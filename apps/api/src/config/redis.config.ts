import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => {
  const redisHost = process.env.REDIS_HOST || 'localhost';
  // REDIS_HOST-д бүтэн URL орсон тохиолдолд (redis:// эсвэл rediss://) url болгон ашиглана
  // Render дээр REDIS_HOST=rediss://... гэж тохируулсан тохиолдолд автомат дэмжинэ
  const hostIsUrl = redisHost.startsWith('redis://') || redisHost.startsWith('rediss://');

  return {
    // REDIS_URL → REDIS_HOST (URL бол) → host/port дараалалтайгаар шалгана
    url: process.env.REDIS_URL || (hostIsUrl ? redisHost : undefined),
    host: hostIsUrl ? 'localhost' : redisHost,
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    // Upstash болон TLS шаарддаг Redis provider-уудад ашиглана
    tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
  };
});
