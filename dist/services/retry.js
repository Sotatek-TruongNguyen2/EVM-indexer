"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetryConfig = void 0;
var ethers_1 = require("ethers");
var indexer_1 = require("../config/indexer");
var timeout_1 = require("../utils/timeout");
var ExponentialBackOff = /** @class */ (function () {
    function ExponentialBackOff(base, max_delay) {
        this._current = base;
        this._base = base;
        this._factor = 1;
        this._max_delay = max_delay || 0;
    }
    Object.defineProperty(ExponentialBackOff.prototype, "current", {
        get: function () {
            return this._current;
        },
        set: function (current) {
            this._current = current;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ExponentialBackOff.prototype, "base", {
        get: function () {
            return this._base;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ExponentialBackOff.prototype, "factor", {
        get: function () {
            return this._factor;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ExponentialBackOff.prototype, "max_delay", {
        get: function () {
            return this._max_delay;
        },
        enumerable: false,
        configurable: true
    });
    ExponentialBackOff.prototype.next_duration = function () {
        var MAX_I64 = Math.pow(2, 64);
        var duration = ethers_1.BigNumber.from(this.current).mul(this.factor);
        if (duration.gt(ethers_1.BigNumber.from("".concat(MAX_I64)))) {
            duration = ethers_1.BigNumber.from("".concat(MAX_I64));
        }
        // check if we reached max delay
        if (this.max_delay > 0) {
            if (duration.gt(this.max_delay)) {
                return this.max_delay;
            }
        }
        this.current = ethers_1.BigNumber.from(this.current).mul(this.base).toNumber();
        if (ethers_1.BigNumber.from(this.current).gt(ethers_1.BigNumber.from("".concat(MAX_I64)))) {
            this.current = ethers_1.BigNumber.from("".concat(MAX_I64)).toNumber();
        }
        return duration.toNumber();
    };
    return ExponentialBackOff;
}());
var RetryConfig = /** @class */ (function () {
    function RetryConfig(operation_name, logger, too_many_logs_fingerprints, limit, timeout) {
        var indexer_config = indexer_1.IndexerConfig.getInstance();
        this._too_many_logs_fingerprints = too_many_logs_fingerprints;
        this._logger = logger;
        this._operation_name = operation_name;
        this._log_after = 1;
        this._warn_after = 10;
        this._limit = limit || indexer_config.REQUEST_RETRIES;
        this._timeout = timeout || indexer_config.ETHEREUM_JSON_RPC_TIMEOUT;
        this._attempt_count = 0;
        var max_delay_ms = 15000;
        this._backoff = new ExponentialBackOff(2000, max_delay_ms);
    }
    Object.defineProperty(RetryConfig.prototype, "limit", {
        get: function () {
            return this._limit;
        },
        set: function (limit) {
            this._limit = limit;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RetryConfig.prototype, "attempt_count", {
        get: function () {
            return this._attempt_count;
        },
        set: function (attempt_count) {
            this._attempt_count = attempt_count;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RetryConfig.prototype, "backoff", {
        get: function () {
            return this._backoff;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RetryConfig.prototype, "too_many_logs_fingerprints", {
        get: function () {
            return this._too_many_logs_fingerprints;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RetryConfig.prototype, "logger", {
        get: function () {
            return this._logger;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RetryConfig.prototype, "timeout", {
        get: function () {
            return this._timeout;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RetryConfig.prototype, "log_after", {
        get: function () {
            return this._log_after;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RetryConfig.prototype, "warn_after", {
        get: function () {
            return this._warn_after;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RetryConfig.prototype, "operation_name", {
        get: function () {
            return this._operation_name;
        },
        enumerable: false,
        configurable: true
    });
    RetryConfig.prototype.run = function (try_it) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.info("Run with retry: ".concat(this.operation_name));
                        return [4 /*yield*/, this.run_retry(try_it)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    RetryConfig.prototype.run_retry = function (try_it) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.run_retry_with_timeout(try_it)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    RetryConfig.prototype.run_retry_with_timeout = function (try_it) {
        return __awaiter(this, void 0, void 0, function () {
            var request_limit_error, result, err_1, isElapsed, intolerant_error, duration;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.limit < this.attempt_count) {
                            request_limit_error = new Error("Request has reached the limitation error!");
                            request_limit_error.name = "RequestLimitErr";
                            throw request_limit_error;
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 6]);
                        this.attempt_count += 1;
                        return [4 /*yield*/, (0, timeout_1.timeout)(try_it, this.timeout)];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, result];
                    case 3:
                        err_1 = _a.sent();
                        console.log("ERROR: ", err_1.message);
                        isElapsed = void 0;
                        if (err_1.name === "TimeoutErr::Elapsed") {
                            isElapsed = true;
                        }
                        if (isElapsed) {
                            if (this.attempt_count >= this.log_after) {
                                this.logger.info("Trying again after ".concat(this.operation_name, " timed out (attempt #").concat(this.attempt_count, ")"));
                            }
                            // let duration = this.backoff.next_duration();
                            // await wait(duration);
                            // return await this.run_retry(try_it);
                        }
                        else {
                            if (this.too_many_logs_fingerprints.indexOf(err_1.message) < 0) {
                                intolerant_error = new Error("The request response is not on response tolerant list");
                                intolerant_error.name = "IntolerantErr";
                                intolerant_error.inner = err_1.message;
                                throw intolerant_error;
                            }
                            if (this.attempt_count >= this.warn_after) {
                                // This looks like it would be nice to de-duplicate, but if we try
                                // to use log! slog complains about requiring a const for the log level
                                // See also b05e1594-e408-4047-aefb-71fc60d70e8f
                                this.logger.warn("Trying again after ".concat(this.operation_name, " failed (attempt #").concat(this.attempt_count, ") with result ").concat(err_1.message));
                            }
                            else if (this.attempt_count >= this.log_after) {
                                // See also b05e1594-e408-4047-aefb-71fc60d70e8f
                                this.logger.info("Trying again after ".concat(this.operation_name, " failed (attempt #").concat(this.attempt_count, ") with result ").concat(err_1.message));
                            }
                        }
                        duration = this.backoff.next_duration();
                        // setTimeout(() => {}, duration);
                        return [4 /*yield*/, (0, timeout_1.wait)(duration)];
                    case 4:
                        // setTimeout(() => {}, duration);
                        _a.sent();
                        return [4 /*yield*/, this.run_retry(try_it)];
                    case 5: return [2 /*return*/, _a.sent()];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    return RetryConfig;
}());
exports.RetryConfig = RetryConfig;
