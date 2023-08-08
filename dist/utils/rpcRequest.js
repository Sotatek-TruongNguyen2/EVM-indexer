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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.callRPCRawMethod = exports.callRPCMethod = void 0;
var axios_1 = __importDefault(require("axios"));
var chainConfig_1 = require("../config/chainConfig");
var errors_1 = require("../services/errors");
var redis_1 = require("../caching/redis");
var indexer_1 = require("../config/indexer");
/***
 * Wraps any callable with a retry mechanism, primarily used for fault tolerance
 * against failing RPCs
 *
 * @param {function} callable
 * @param logger
 * @param chainName
 * @return {Promise<*>}
 */
function callRPCMethod(chainId, callable, params, logger) {
    return __awaiter(this, void 0, void 0, function () {
        var redis_client, indexer_config, provider, res, failed_time, err_1, updated_failed_time, matched, new_rpc_url;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    redis_client = redis_1.RedisConnection.getClient();
                    indexer_config = indexer_1.IndexerConfig.getInstance();
                    provider = (0, chainConfig_1.getRPCProvider)(chainId);
                    res = null;
                    return [4 /*yield*/, redis_client.get("".concat(chainId, "_").concat(callable, "_failed_counter"))];
                case 1:
                    failed_time = _a.sent();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 5, , 9]);
                    return [4 /*yield*/, (params ? provider[callable].apply(provider, __spreadArray([], __read(params), false)) : provider[callable]())];
                case 3:
                    res = _a.sent();
                    return [4 /*yield*/, redis_client.del("".concat(chainId, "_").concat(callable, "_failed_counter"))];
                case 4:
                    _a.sent();
                    return [2 /*return*/, res];
                case 5:
                    err_1 = _a.sent();
                    console.log("ERROR: ", err_1.message);
                    updated_failed_time = failed_time ? Number(failed_time) + 1 : 0;
                    console.log("updated_failed_time: ", updated_failed_time);
                    return [4 /*yield*/, redis_client.set("".concat(chainId, "_").concat(callable, "_failed_counter"), updated_failed_time)];
                case 6:
                    _a.sent();
                    matched = errors_1.TOO_MANY_LOGS_FINGERPRINTS.some(function (error) {
                        return err_1.message.includes(error);
                    });
                    if (!(matched &&
                        updated_failed_time >
                            indexer_config.MAXIMUM_RPC_REQUEST_FAILED_TOLERANT_TIMES)) return [3 /*break*/, 8];
                    new_rpc_url = (0, chainConfig_1.setProviderIndex)(chainId);
                    logger &&
                        logger.info("Set network ".concat(chainId, " current RPC url to: ").concat(new_rpc_url.connection.url));
                    return [4 /*yield*/, redis_client.del("".concat(chainId, "_").concat(callable, "_failed_counter"))];
                case 7:
                    _a.sent();
                    _a.label = 8;
                case 8: throw err_1;
                case 9: return [2 /*return*/];
            }
        });
    });
}
exports.callRPCMethod = callRPCMethod;
function callRPCRawMethod(chainId, method, params, logger) {
    return __awaiter(this, void 0, void 0, function () {
        var provider, redis_client, indexer_config, failed_time, instance, res, response, err_2, updated_failed_time, matched, new_rpc_url;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, chainConfig_1.getRPCProvider)(chainId)];
                case 1:
                    provider = _a.sent();
                    redis_client = redis_1.RedisConnection.getClient();
                    indexer_config = indexer_1.IndexerConfig.getInstance();
                    return [4 /*yield*/, redis_client.get("raw_".concat(chainId, "_").concat(method, "_failed_counter"))];
                case 2:
                    failed_time = _a.sent();
                    console.log("raw_".concat(chainId, "_").concat(method, "_failed_counter"), failed_time);
                    instance = axios_1.default.create({
                        baseURL: provider.connection.url,
                        headers: {
                            "Content-Type": "application/json",
                        },
                        timeout: 10000,
                    });
                    res = null;
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 6, , 10]);
                    return [4 /*yield*/, instance.post("/", JSON.stringify({
                            method: method,
                            params: params,
                            id: 1,
                            jsonrpc: "2.0",
                        }), {
                            headers: {
                                // Overwrite Axios's automatically set Content-Type
                                "Content-Type": "application/json",
                            },
                        })];
                case 4:
                    response = _a.sent();
                    return [4 /*yield*/, redis_client.del("raw_".concat(chainId, "_").concat(method, "_failed_counter"))];
                case 5:
                    _a.sent();
                    res = response.data.result;
                    return [2 /*return*/, res];
                case 6:
                    err_2 = _a.sent();
                    console.log("ERROR: ", err_2.message);
                    updated_failed_time = failed_time ? Number(failed_time) + 1 : 0;
                    console.log("WE HERE: ", updated_failed_time);
                    return [4 /*yield*/, redis_client.set("raw_".concat(chainId, "_").concat(method, "_failed_counter"), updated_failed_time)];
                case 7:
                    _a.sent();
                    matched = errors_1.TOO_MANY_LOGS_FINGERPRINTS.some(function (error) {
                        return err_2.message.includes(error);
                    });
                    if (!(matched &&
                        updated_failed_time >
                            indexer_config.MAXIMUM_RPC_REQUEST_FAILED_TOLERANT_TIMES)) return [3 /*break*/, 9];
                    new_rpc_url = (0, chainConfig_1.setProviderIndex)(chainId);
                    logger &&
                        logger.info("Set network ".concat(chainId, " current RPC url to: ").concat(new_rpc_url.connection.url));
                    return [4 /*yield*/, redis_client.del("raw_".concat(chainId, "_").concat(method, "_failed_counter"))];
                case 8:
                    _a.sent();
                    _a.label = 9;
                case 9: throw err_2;
                case 10: return [2 /*return*/];
            }
        });
    });
}
exports.callRPCRawMethod = callRPCRawMethod;
