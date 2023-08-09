import { RedisOptions } from "ioredis";

export type RedisConfig = {
  port: number;
  host: string;
  options: RedisOptions;
};

const getRedisConfigFromEnv = (): RedisConfig => {
  const config: RedisConfig = {
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
    options: {},
  };

  let tls_support = process.env.REDIS_TLS_SUPPORT;
  let username = process.env.REDIS_USERNAME;
  let password = process.env.REDIS_PASSWORD;

  if (tls_support) {
    config.options.tls = {
      host: config.host,
      port: config.port,
    };
  }

  if (username) {
    config.options.username = username;
  }

  if (password) {
    config.options.password = password;
  }

  return config;
};

// export const redisConfig: RedisConfig = {
//   host: process.env.REDIS_HOST || "localhost",
//   port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
//   options: {
//     username: "default",
//     password: process.env.REDIS_PASSWORD || "",
//     tls: {
//       host: process.env.REDIS_HOST,
//     },
//   },
// };

export const getDefaultRedisConfig = (): RedisConfig => {
  return getRedisConfigFromEnv();
};
