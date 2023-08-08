import Redis, { RedisOptions } from 'ioredis';

import { getDefaultRedisConfig } from '../config/redis';

export class RedisConnection {
  static _CLIENT: Redis;

  static getClient(optionsOverride: RedisOptions | null = null): Redis {
    if (!this._CLIENT) {
      try {
        const redisConfig = getDefaultRedisConfig();
        const redisOptions = optionsOverride
          ? optionsOverride
          : redisConfig.options;

        console.log(redisConfig, redisOptions);
        this._CLIENT = new Redis(
          redisConfig.port,
          redisConfig.host,
          redisOptions,
        );
      } catch (err) {
        console.log('[REDIS][ERROR] ', err);
      }
    }

    return this._CLIENT;
  }
}
