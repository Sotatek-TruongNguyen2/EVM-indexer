"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefaultRedisConfig = exports.redisConfig = void 0;
console.log(process.env.REDIS_HOST);
exports.redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
    options: {
        username: "default"
    },
};
var getDefaultRedisConfig = function () {
    return exports.redisConfig;
};
exports.getDefaultRedisConfig = getDefaultRedisConfig;
