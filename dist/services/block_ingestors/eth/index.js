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
exports.BlockIngestor = void 0;
var adapters_1 = require("../../adapters");
var indexer_1 = require("../../../config/indexer");
var logger_1 = require("../../../utils/logger");
var chainConfig_1 = require("../../../config/chainConfig");
var rpcRequest_1 = require("../../../utils/rpcRequest");
var types_1 = require("../../store/types");
var BlockIngestor = /** @class */ (function () {
    function BlockIngestor(chain_id, chain_store) {
        var indexer_config = indexer_1.IndexerConfig.getInstance();
        this._chain_store = chain_store;
        this._adapter = new adapters_1.ETHAdapter(chain_id, this.chain_store);
        this._polling_interval = indexer_config.INGESTOR_POLLING_INTERVAL;
        this._ancestor_count = indexer_config.REORG_THRESHOLD;
        this._chain_id = chain_id;
        var chainConfig = chainConfig_1.ChainConfig[chain_id];
        if (chainConfig) {
            this._logger = (0, logger_1.getIndexerLogger)("".concat(chainConfig.name, "_chain_head_ptr"));
        }
    }
    Object.defineProperty(BlockIngestor.prototype, "chain_store", {
        get: function () {
            return this._chain_store;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BlockIngestor.prototype, "adapter", {
        get: function () {
            return this._adapter;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BlockIngestor.prototype, "polling_interval", {
        get: function () {
            return this._polling_interval;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BlockIngestor.prototype, "ancestor_count", {
        get: function () {
            return this._ancestor_count;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BlockIngestor.prototype, "chain_id", {
        get: function () {
            return this._chain_id;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BlockIngestor.prototype, "logger", {
        get: function () {
            return this._logger;
        },
        enumerable: false,
        configurable: true
    });
    BlockIngestor.prototype.ingest_block = function (block_hash) {
        return __awaiter(this, void 0, void 0, function () {
            var block, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.adapter.get_block_by_hash_with_logs(block_hash)];
                    case 1:
                        block = _a.sent();
                        return [4 /*yield*/, this.chain_store.upsert_block(block)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.chain_store.attempt_chain_head_update()];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4:
                        err_1 = _a.sent();
                        this.logger.debug(err_1.message);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    BlockIngestor.prototype.do_ingest_block = function () {
        return __awaiter(this, void 0, void 0, function () {
            var latest_block, chain_head_ptr, latest_number, head_ptr_number, distance, blocks_needed, code, missing_parent, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 7, , 8]);
                        return [4 /*yield*/, (0, rpcRequest_1.callRPCMethod)(this.chain_id, "getBlock", [
                                "latest",
                            ])];
                    case 1:
                        latest_block = _a.sent();
                        return [4 /*yield*/, this.chain_store.chain_head_ptr()];
                    case 2:
                        chain_head_ptr = _a.sent();
                        console.log("chain_head_ptr: ", chain_head_ptr);
                        if (chain_head_ptr) {
                            if (chain_head_ptr.number == latest_block.number) {
                                return [2 /*return*/];
                            }
                            if (chain_head_ptr.number > latest_block.number) {
                                this.logger.warn("Provider went backwards - ignoring this latest block. current_block_head: ".concat(chain_head_ptr.number, ", latest_block_head: ").concat(latest_block.number));
                                return [2 /*return*/];
                            }
                        }
                        if (!chain_head_ptr) {
                            this.logger.info("Downloading latest blocks from Ethereum, this may take a few minutes...");
                        }
                        else {
                            latest_number = latest_block.number;
                            head_ptr_number = chain_head_ptr.number;
                            distance = latest_number - head_ptr_number;
                            blocks_needed = Math.min(distance, this.ancestor_count);
                            code = types_1.LogCode.BlockIngestionStatus;
                            if (blocks_needed > 15) {
                                code = types_1.LogCode.BlockIngestionLagging;
                            }
                            if (distance > 0) {
                                this.logger.info("Syncing ".concat(blocks_needed, " blocks from Ethereum. current_block_head: ").concat(head_ptr_number, ", latest_block_head: ").concat(latest_number, ", blocks_behind: ").concat(distance, ", blocks_needed: ").concat(blocks_needed, ", code: ").concat(code === types_1.LogCode.BlockIngestionLagging ? "Lagging" : "Status"));
                            }
                        }
                        return [4 /*yield*/, this.ingest_block(latest_block.hash)];
                    case 3:
                        missing_parent = _a.sent();
                        _a.label = 4;
                    case 4:
                        if (!missing_parent) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.ingest_block(missing_parent)];
                    case 5:
                        missing_parent = _a.sent();
                        return [3 /*break*/, 4];
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        err_2 = _a.sent();
                        console.log(err_2.message);
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    BlockIngestor.prototype.do_poll = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.do_ingest_block()];
                    case 1:
                        _a.sent();
                        setTimeout(function () {
                            _this.do_poll();
                        }, this.polling_interval);
                        return [2 /*return*/];
                }
            });
        });
    };
    BlockIngestor.prototype.start = function () {
        this.do_poll();
    };
    return BlockIngestor;
}());
exports.BlockIngestor = BlockIngestor;
