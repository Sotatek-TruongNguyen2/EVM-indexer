"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisConnection = void 0;
var ioredis_1 = __importDefault(require("ioredis"));
var redis_1 = require("../config/redis");
var RedisConnection = /** @class */ (function () {
    function RedisConnection() {
    }
    RedisConnection.getClient = function (optionsOverride) {
        if (optionsOverride === void 0) { optionsOverride = null; }
        if (!this._CLIENT) {
            try {
                var redisConfig = (0, redis_1.getDefaultRedisConfig)();
                var redisOptions = optionsOverride
                    ? optionsOverride
                    : redisConfig.options;
                this._CLIENT = new ioredis_1.default(redisConfig.port, redisConfig.host, redisOptions);
            }
            catch (err) {
                console.log('[REDIS][ERROR] ', err);
            }
        }
        return this._CLIENT;
    };
    return RedisConnection;
}());
exports.RedisConnection = RedisConnection;
