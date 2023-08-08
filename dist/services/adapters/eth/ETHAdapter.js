"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ETHAdapter = void 0;
var chainConfig_1 = require("../../../config/chainConfig");
var indexer_1 = require("../../../config/indexer");
var logger_1 = require("../../../utils/logger");
var rpcRequest_1 = require("../../../utils/rpcRequest");
var retry_1 = require("../../retry");
var ethereum_block_model_1 = require("../../../models/ethereum-block.model");
var errors_1 = require("../../errors");
var ETHAdapter = /** @class */ (function () {
    function ETHAdapter(chain_id, chain_store) {
        var indexer_config = indexer_1.IndexerConfig.getInstance();
        this._chain_id = chain_id;
        this._block_batch_size = indexer_config.ETHEREUM_BLOCK_BATCH_SIZE;
        this._chain_store = chain_store;
        var chainConfig = chainConfig_1.ChainConfig[this.chain_id];
        this._logger = (0, logger_1.getIndexerLogger)("".concat(chainConfig.name, "_").concat(ETHAdapter.name));
    }
    Object.defineProperty(ETHAdapter.prototype, "chain_id", {
        get: function () {
            return this._chain_id;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ETHAdapter.prototype, "logger", {
        get: function () {
            return this._logger;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ETHAdapter.prototype, "chain_store", {
        get: function () {
            return this._chain_store;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ETHAdapter.prototype, "block_batch_size", {
        get: function () {
            return this._block_batch_size;
        },
        enumerable: false,
        configurable: true
    });
    ETHAdapter.prototype.ancestor_block = function (block_ptr, offset) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.chain_store.ancestor_block(block_ptr, offset)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    ETHAdapter.prototype.load_blocks = function (ids, chain_store) {
        return __awaiter(this, void 0, void 0, function () {
            var blocks_in_db, missing_blocks_hash, missing_blocks, missing_blocks_1, missing_blocks_1_1, block, block_with_logs, err_1, e_1_1;
            var e_1, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, ethereum_block_model_1.EthereumBlocks.find({
                            block_hash: {
                                $in: ids,
                            },
                        })];
                    case 1:
                        blocks_in_db = (_b.sent());
                        missing_blocks_hash = ids.filter(function (id) { return !blocks_in_db.some(function (block) { return block.block_hash === id; }); });
                        this.logger.info("Requesting ".concat(missing_blocks_hash.length, " block(s)"));
                        return [4 /*yield*/, this.load_blocks_rpc(missing_blocks_hash)];
                    case 2:
                        missing_blocks = _b.sent();
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 10, 11, 12]);
                        missing_blocks_1 = __values(missing_blocks), missing_blocks_1_1 = missing_blocks_1.next();
                        _b.label = 4;
                    case 4:
                        if (!!missing_blocks_1_1.done) return [3 /*break*/, 9];
                        block = missing_blocks_1_1.value;
                        _b.label = 5;
                    case 5:
                        _b.trys.push([5, 7, , 8]);
                        return [4 /*yield*/, chain_store.upsert_light_block(block)];
                    case 6:
                        block_with_logs = _b.sent();
                        blocks_in_db.push(block_with_logs);
                        return [3 /*break*/, 8];
                    case 7:
                        err_1 = _b.sent();
                        this.logger.warn("Error writing to block cache ".concat(err_1.message));
                        return [3 /*break*/, 8];
                    case 8:
                        missing_blocks_1_1 = missing_blocks_1.next();
                        return [3 /*break*/, 4];
                    case 9: return [3 /*break*/, 12];
                    case 10:
                        e_1_1 = _b.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 12];
                    case 11:
                        try {
                            if (missing_blocks_1_1 && !missing_blocks_1_1.done && (_a = missing_blocks_1.return)) _a.call(missing_blocks_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                        return [7 /*endfinally*/];
                    case 12: return [2 /*return*/, blocks_in_db];
                }
            });
        });
    };
    ETHAdapter.prototype.load_blocks_rpc = function (ids) {
        return __awaiter(this, void 0, void 0, function () {
            var load_block, run_retry_with_block, blocks, batches_index, block_fetch_batch_retries, ids_1, ids_1_1, id, block_fetch_batch_retries_1, block_fetch_batch_retries_1_1, block_fetch_batch, result, e_2_1;
            var e_3, _a, e_2, _b;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        load_block = function (id) { return function () { return __awaiter(_this, void 0, void 0, function () {
                            var block_with_txs;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, this.get_block_by_hash_with_logs(id)];
                                    case 1:
                                        block_with_txs = _a.sent();
                                        return [2 /*return*/, block_with_txs];
                                }
                            });
                        }); }; };
                        run_retry_with_block = function (id, logger) {
                            return function () {
                                return __awaiter(this, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        return [2 /*return*/, new retry_1.RetryConfig("load block ".concat(id), logger, errors_1.TOO_MANY_LOGS_FINGERPRINTS).run(load_block(id)())];
                                    });
                                });
                            };
                        };
                        blocks = [];
                        batches_index = 0;
                        block_fetch_batch_retries = [];
                        try {
                            for (ids_1 = __values(ids), ids_1_1 = ids_1.next(); !ids_1_1.done; ids_1_1 = ids_1.next()) {
                                id = ids_1_1.value;
                                if (!block_fetch_batch_retries[batches_index])
                                    block_fetch_batch_retries[batches_index] = [];
                                block_fetch_batch_retries[batches_index].push(run_retry_with_block(id, this.logger));
                                if (((batches_index + 1) * this.block_batch_size) /
                                    Object.keys(block_fetch_batch_retries[batches_index]).length ==
                                    1) {
                                    batches_index++;
                                }
                            }
                        }
                        catch (e_3_1) { e_3 = { error: e_3_1 }; }
                        finally {
                            try {
                                if (ids_1_1 && !ids_1_1.done && (_a = ids_1.return)) _a.call(ids_1);
                            }
                            finally { if (e_3) throw e_3.error; }
                        }
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 6, 7, 8]);
                        block_fetch_batch_retries_1 = __values(block_fetch_batch_retries), block_fetch_batch_retries_1_1 = block_fetch_batch_retries_1.next();
                        _c.label = 2;
                    case 2:
                        if (!!block_fetch_batch_retries_1_1.done) return [3 /*break*/, 5];
                        block_fetch_batch = block_fetch_batch_retries_1_1.value;
                        return [4 /*yield*/, Promise.allSettled(block_fetch_batch.map(function (block_fetch) { return block_fetch(); }))];
                    case 3:
                        result = _c.sent();
                        result.forEach(function (block_fetch_result) {
                            if (block_fetch_result.status === "fulfilled") {
                                blocks.push(block_fetch_result.value);
                            }
                        });
                        _c.label = 4;
                    case 4:
                        block_fetch_batch_retries_1_1 = block_fetch_batch_retries_1.next();
                        return [3 /*break*/, 2];
                    case 5: return [3 /*break*/, 8];
                    case 6:
                        e_2_1 = _c.sent();
                        e_2 = { error: e_2_1 };
                        return [3 /*break*/, 8];
                    case 7:
                        try {
                            if (block_fetch_batch_retries_1_1 && !block_fetch_batch_retries_1_1.done && (_b = block_fetch_batch_retries_1.return)) _b.call(block_fetch_batch_retries_1);
                        }
                        finally { if (e_2) throw e_2.error; }
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/, blocks];
                }
            });
        });
    };
    ETHAdapter.prototype.get_block_hash_by_block_number = function (block_number) {
        return __awaiter(this, void 0, void 0, function () {
            var retry, get_block_hash, result, err_2;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        retry = new retry_1.RetryConfig("eth_getBlockByNumber RPC call for block number ".concat(block_number), this.logger, errors_1.TOO_MANY_LOGS_FINGERPRINTS);
                        get_block_hash = function (block_number) { return function () { return __awaiter(_this, void 0, void 0, function () {
                            var result;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, rpcRequest_1.callRPCMethod)(this.chain_id, "getBlock", [
                                            block_number,
                                        ])];
                                    case 1:
                                        result = _a.sent();
                                        return [2 /*return*/, result];
                                }
                            });
                        }); }; };
                        return [4 /*yield*/, retry.run(get_block_hash(block_number)())];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.hash];
                    case 2:
                        err_2 = _a.sent();
                        this.logger.warn("Ethereum node took too long to return data for block #".concat(block_number));
                        throw err_2;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ETHAdapter.prototype.get_block_by_hash = function (block_hash) {
        return __awaiter(this, void 0, void 0, function () {
            var retry, get_block_hash, result, err_3;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        retry = new retry_1.RetryConfig("eth_getBlockByHash RPC call for block hash ".concat(block_hash), this.logger, errors_1.TOO_MANY_LOGS_FINGERPRINTS);
                        get_block_hash = function (block_hash) { return function () { return __awaiter(_this, void 0, void 0, function () {
                            var result;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, rpcRequest_1.callRPCRawMethod)(this.chain_id, "eth_getBlockByHash", [block_hash, true], this.logger)];
                                    case 1:
                                        result = _a.sent();
                                        return [2 /*return*/, result];
                                }
                            });
                        }); }; };
                        return [4 /*yield*/, retry.run(get_block_hash(block_hash)())];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result];
                    case 2:
                        err_3 = _a.sent();
                        this.logger.warn("Ethereum node took too long to return data for block #".concat(block_hash));
                        throw err_3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ETHAdapter.prototype.get_block_by_hash_with_logs = function (block_hash) {
        return __awaiter(this, void 0, void 0, function () {
            var retry, get_block_hash_with_logs, result, err_4;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        retry = new retry_1.RetryConfig("eth_getBlockByHash RPC call for block number ".concat(block_hash), this.logger, errors_1.TOO_MANY_LOGS_FINGERPRINTS);
                        get_block_hash_with_logs = function (block_hash) { return function () { return __awaiter(_this, void 0, void 0, function () {
                            var result, tx_to_sender, logs, logs_with_sender;
                            var _this = this;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, rpcRequest_1.callRPCRawMethod)(this.chain_id, "eth_getBlockByHash", [block_hash, true], this.logger)];
                                    case 1:
                                        result = (_a.sent());
                                        tx_to_sender = new Map();
                                        result.transactions.forEach(function (tx) {
                                            if (tx_to_sender.get(tx.hash)) {
                                                var error = "Duplicate Tx hash in block ".concat(result.number);
                                                _this.logger.warn(error);
                                            }
                                            tx_to_sender.set(tx.hash, { from: tx.from });
                                        });
                                        return [4 /*yield*/, (0, rpcRequest_1.callRPCRawMethod)(this.chain_id, "eth_getLogs", [
                                                {
                                                    fromBlock: result.number,
                                                    toBlock: result.number,
                                                },
                                            ], this.logger)];
                                    case 2:
                                        logs = (_a.sent());
                                        logs_with_sender = logs.map(function (log) { return (__assign(__assign({}, log), { sender: tx_to_sender.get(log.transactionHash).from })); });
                                        return [2 /*return*/, {
                                                hash: result.hash,
                                                gasUsed: result.gasUsed,
                                                gasLimit: result.gasLimit,
                                                number: result.number,
                                                timestamp: result.timestamp,
                                                parentHash: result.parentHash,
                                                logs: logs_with_sender,
                                            }];
                                }
                            });
                        }); }; };
                        return [4 /*yield*/, retry.run(get_block_hash_with_logs(block_hash)())];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result];
                    case 2:
                        err_4 = _a.sent();
                        this.logger.warn("Ethereum node took too long to return data for block #".concat(block_hash));
                        throw err_4;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ETHAdapter.prototype.is_on_main_chain = function (block_ptr) {
        return __awaiter(this, void 0, void 0, function () {
            var block_hash;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.get_block_hash_by_block_number(block_ptr.number)];
                    case 1:
                        block_hash = _a.sent();
                        return [2 /*return*/, block_hash === block_ptr.hash];
                }
            });
        });
    };
    ETHAdapter.prototype.get_ancestor_block = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/];
        }); });
    };
    return ETHAdapter;
}());
exports.ETHAdapter = ETHAdapter;
