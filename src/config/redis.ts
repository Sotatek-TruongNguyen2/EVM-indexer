import { Redis, RedisOptions } from 'ioredis';

export type RedisConfig = {
  port: number;
  host: string;
  options: RedisOptions;
};

export const redisConfig: RedisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
  options: {},
};

export const getDefaultRedisConfig = (): RedisConfig => {
  return redisConfig;
};
