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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChainStore = void 0;
var pubsub_js_1 = __importDefault(require("pubsub-js"));
var ethers_1 = require("ethers");
var chain_head_model_1 = require("../../models/chain-head.model");
var logger_1 = require("../../utils/logger");
var chainConfig_1 = require("../../config/chainConfig");
var indexer_1 = require("../../config/indexer");
var redis_1 = require("../../caching/redis");
var ethereum_block_model_1 = require("../../models/ethereum-block.model");
var topics_1 = require("../pubsub/topics");
var ChainStore = /** @class */ (function () {
    function ChainStore(chain_id) {
        var indexer_config = indexer_1.IndexerConfig.getInstance();
        this._polling_interval = indexer_config.INGESTOR_POLLING_INTERVAL;
        this._redis_client = redis_1.RedisConnection.getClient();
        this._capacity = indexer_config.CHAIN_STORE_RECENT_BLOCKS_CACHE_CAPACITY;
        this._ancestor_count = indexer_config.REORG_THRESHOLD;
        this._chain_id = chain_id;
        this._CACHED_KEY = "ChainStore__".concat(chain_id);
        var chainConfig = chainConfig_1.ChainConfig[chain_id];
        if (chainConfig) {
            this._logger = (0, logger_1.getIndexerLogger)("".concat(chainConfig.name, "_chain_head_ptr"));
        }
    }
    Object.defineProperty(ChainStore.prototype, "CACHED_KEY", {
        get: function () {
            return this._CACHED_KEY;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ChainStore.prototype, "polling_interval", {
        get: function () {
            return this._polling_interval;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ChainStore.prototype, "capacity", {
        get: function () {
            return this._capacity;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ChainStore.prototype, "ancestor_count", {
        get: function () {
            return this._ancestor_count;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ChainStore.prototype, "chain_id", {
        get: function () {
            return this._chain_id;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ChainStore.prototype, "redis_client", {
        get: function () {
            return this._redis_client;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ChainStore.prototype, "logger", {
        get: function () {
            return this._logger;
        },
        enumerable: false,
        configurable: true
    });
    ChainStore.prototype.attempt_chain_head_update = function () {
        return __awaiter(this, void 0, void 0, function () {
            var head_block_number, chain_store, chain_head_candidates, chain_head_candidate, first_block, max_depth, missing_parent;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        head_block_number = -1;
                        return [4 /*yield*/, chain_head_model_1.ChainHeadStore.findOne({
                                chain_id: this.chain_id,
                            })];
                    case 1:
                        chain_store = _a.sent();
                        if (chain_store) {
                            head_block_number = chain_store.head_block_number;
                        }
                        return [4 /*yield*/, ethereum_block_model_1.EthereumBlocks.find({})
                                .where("number")
                                .gt(head_block_number)
                                .sort({
                                block_number: -1,
                            })
                                .limit(1)
                                .exec()];
                    case 2:
                        chain_head_candidates = _a.sent();
                        if (!chain_head_candidates.length) return [3 /*break*/, 5];
                        chain_head_candidate = chain_head_candidates[0];
                        first_block = chain_head_candidate.block_number - this.ancestor_count;
                        max_depth = this.ancestor_count;
                        return [4 /*yield*/, this.missing_parents(chain_head_candidate.block_hash, first_block, max_depth)];
                    case 3:
                        missing_parent = _a.sent();
                        if (missing_parent) {
                            return [2 /*return*/, missing_parent];
                        }
                        return [4 /*yield*/, chain_head_model_1.ChainHeadStore.updateOne({
                                $and: [{ chain_id: "".concat(this.chain_id) }],
                            }, {
                                $set: {
                                    chain_id: "".concat(this.chain_id),
                                    head_block_hash: "".concat(chain_head_candidate.block_hash),
                                    head_block_number: "".concat(ethers_1.BigNumber.from(chain_head_candidate.block_number).toNumber()),
                                    network_name: "".concat(chainConfig_1.ChainConfig[this.chain_id].name),
                                },
                            }, {
                                upsert: true,
                            })];
                    case 4:
                        _a.sent();
                        this.logger.info("Update Chain store head to block number: ".concat(chain_head_candidate.block_number));
                        pubsub_js_1.default.publish(topics_1.Topics.CHAIN_HEAD_STORE_UPDATE, {
                            head_block_number: "".concat(ethers_1.BigNumber.from(chain_head_candidate.block_number).toNumber()),
                            head_block_hash: "".concat(chain_head_candidate.block_hash),
                            chain_id: "".concat(this.chain_id),
                        });
                        _a.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    ChainStore.prototype.upsert_block = function (block) {
        return __awaiter(this, void 0, void 0, function () {
            var err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.insert_block(block)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, ethereum_block_model_1.EthereumBlocks.findOneAndUpdate({
                                $and: [
                                    { block_hash: "".concat(block.hash) },
                                    { block_number: "".concat(ethers_1.BigNumber.from(block.number).toNumber()) },
                                    { chain_id: "".concat(this.chain_id) },
                                ],
                            }, {
                                $set: {
                                    chain_id: "".concat(this.chain_id),
                                    block_hash: "".concat(block.hash),
                                    block_number: "".concat(ethers_1.BigNumber.from(block.number).toNumber()),
                                    parent_hash: "".concat(block.parentHash),
                                    network_name: "".concat(chainConfig_1.ChainConfig[this.chain_id].name),
                                    data: {
                                        logs: block.logs,
                                        timestamp: block.timestamp,
                                    },
                                    finalized: block.finalized || false,
                                    timestamp: block.timestamp,
                                },
                            }, {
                                upsert: true,
                                returnOriginal: false,
                            })];
                    case 2: return [2 /*return*/, (_a.sent())];
                    case 3:
                        err_1 = _a.sent();
                        throw err_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ChainStore.prototype.upsert_light_block = function (block) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.upsert_block(__assign(__assign({}, block), { 
                            // logs: [],
                            finalized: true }))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    ChainStore.prototype.chain_head_ptr = function () {
        return __awaiter(this, void 0, void 0, function () {
            var chain_head;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, chain_head_model_1.ChainHeadStore.findOne({ chain_id: this.chain_id })];
                    case 1:
                        chain_head = _a.sent();
                        if (chain_head) {
                            return [2 /*return*/, {
                                    number: chain_head.head_block_number,
                                    hash: chain_head.head_block_hash,
                                }];
                        }
                        this.logger.debug("No head pointer has found. Maybe due to initialization!");
                        return [2 /*return*/];
                }
            });
        });
    };
    ChainStore.prototype.ancestor_block = function (block_ptr, offset) {
        return __awaiter(this, void 0, void 0, function () {
            var cached_blocks, i, tmp, related_blocks;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.redis_client.lrange(this.CACHED_KEY, 0, 20)];
                    case 1:
                        cached_blocks = _a.sent();
                        if (cached_blocks) {
                            for (i = 0; i < cached_blocks.length; i++) {
                                tmp = JSON.parse(cached_blocks[i]);
                                if (tmp.block_number === block_ptr.number - offset) {
                                    return [2 /*return*/, tmp];
                                }
                            }
                        }
                        return [4 /*yield*/, ethereum_block_model_1.EthereumBlocks.aggregate([
                                {
                                    $match: {
                                        block_hash: {
                                            $eq: block_ptr.hash,
                                        },
                                    },
                                },
                                {
                                    $graphLookup: {
                                        from: "ethereumblocks",
                                        connectFromField: "parent_hash",
                                        connectToField: "block_hash",
                                        as: "chain",
                                        startWith: "$block_hash",
                                        maxDepth: offset,
                                        restrictSearchWithMatch: {
                                            $and: [{ chain_id: this.chain_id }],
                                        },
                                    },
                                },
                                {
                                    $unwind: "$chain",
                                },
                                {
                                    $project: {
                                        _id: 0,
                                        chain: 1,
                                    },
                                },
                                {
                                    $group: {
                                        _id: "$chain._id",
                                        parent_hash: {
                                            $first: "$chain.parent_hash",
                                        },
                                        block_number: {
                                            $first: "$chain.block_number",
                                        },
                                        block_hash: {
                                            $first: "$chain.block_hash",
                                        },
                                        chain_id: {
                                            $first: "$chain.chain_id",
                                        },
                                        network_name: {
                                            $first: "$chain.network_name",
                                        },
                                        finalized: {
                                            $first: "$chain.finalized",
                                        },
                                        data: {
                                            $first: "$chain.data",
                                        },
                                    },
                                },
                                {
                                    $sort: { block_number: 1 },
                                },
                            ])];
                    case 2:
                        related_blocks = _a.sent();
                        if (related_blocks.length - 1 === offset) {
                            return [2 /*return*/, related_blocks[0]];
                            // return {
                            //   is_finalized: block.finalized,
                            //   parent_hash: block.parent_hash,
                            //   ptr: {
                            //     hash: block.block_hash,
                            //     number: block.block_number,
                            //   },
                            // };
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    ChainStore.prototype.cached_chain_head = function () {
        return __awaiter(this, void 0, void 0, function () {
            var cached_block;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.redis_client.lindex(this.CACHED_KEY, "-1")];
                    case 1:
                        cached_block = _a.sent();
                        if (cached_block) {
                            return [2 /*return*/, JSON.parse(cached_block)];
                        }
                        return [2 /*return*/, null];
                }
            });
        });
    };
    ChainStore.prototype.insert_block = function (block) {
        return __awaiter(this, void 0, void 0, function () {
            var chain_head, cached_block, earliest_block, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!block.parentHash) return [3 /*break*/, 13];
                        return [4 /*yield*/, this.cached_chain_head()];
                    case 1:
                        chain_head = _c.sent();
                        cached_block = {
                            is_finalized: false,
                            parent_hash: block.parentHash,
                            ptr: {
                                hash: block.hash,
                                number: ethers_1.BigNumber.from(block.number).toNumber(),
                            },
                        };
                        if (!!chain_head) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.redis_client.rpush(this.CACHED_KEY, JSON.stringify(cached_block))];
                    case 2:
                        _c.sent();
                        return [3 /*break*/, 13];
                    case 3:
                        console.log("iNTESTING: ", chain_head.ptr, cached_block);
                        if (!(chain_head.ptr.hash === cached_block.parent_hash)) return [3 /*break*/, 5];
                        // We have a new chain head that is a direct child of our
                        // previous chain head, so we get to keep all items in the
                        // cache.
                        return [4 /*yield*/, this.redis_client.rpushx(this.CACHED_KEY, JSON.stringify(cached_block))];
                    case 4:
                        // We have a new chain head that is a direct child of our
                        // previous chain head, so we get to keep all items in the
                        // cache.
                        _c.sent();
                        return [3 /*break*/, 11];
                    case 5:
                        if (!(cached_block.ptr.number > chain_head.ptr.number)) return [3 /*break*/, 8];
                        // We have a new chain head, but it's not a direct child of
                        // our previous chain head. This means that we must
                        // invalidate all the items in the cache before inserting
                        // this block.
                        return [4 /*yield*/, this.redis_client.del(this.CACHED_KEY)];
                    case 6:
                        // We have a new chain head, but it's not a direct child of
                        // our previous chain head. This means that we must
                        // invalidate all the items in the cache before inserting
                        // this block.
                        _c.sent();
                        return [4 /*yield*/, this.redis_client.rpushx(this.CACHED_KEY, JSON.stringify(cached_block))];
                    case 7:
                        _c.sent();
                        return [3 /*break*/, 11];
                    case 8:
                        _b = (_a = JSON).parse;
                        return [4 /*yield*/, this.redis_client.lindex(this.CACHED_KEY, 0)];
                    case 9:
                        earliest_block = _b.apply(_a, [(_c.sent())]);
                        if (!(earliest_block.parent_hash === cached_block.ptr.hash)) return [3 /*break*/, 11];
                        return [4 /*yield*/, this.redis_client.lpushx(this.CACHED_KEY, JSON.stringify(cached_block))];
                    case 10:
                        _c.sent();
                        _c.label = 11;
                    case 11: return [4 /*yield*/, this.evict_if_necessary()];
                    case 12:
                        _c.sent();
                        _c.label = 13;
                    case 13: return [2 /*return*/];
                }
            });
        });
    };
    ChainStore.prototype.missing_parents = function (chain_head_candidate_ptr, first_block, max_depth) {
        return __awaiter(this, void 0, void 0, function () {
            var related_blocks;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, ethereum_block_model_1.EthereumBlocks.aggregate([
                            {
                                $match: {
                                    block_hash: {
                                        $eq: chain_head_candidate_ptr,
                                    },
                                },
                            },
                            {
                                $graphLookup: {
                                    from: "ethereumblocks",
                                    connectFromField: "parent_hash",
                                    connectToField: "block_hash",
                                    as: "chain",
                                    startWith: "$block_hash",
                                    maxDepth: max_depth,
                                    restrictSearchWithMatch: {
                                        $and: [{ chain_id: this.chain_id }],
                                    },
                                },
                            },
                            {
                                $unwind: "$chain",
                            },
                            {
                                $project: {
                                    _id: 0,
                                    chain: 1,
                                },
                            },
                            {
                                $group: {
                                    _id: "$chain._id",
                                    parent_hash: {
                                        $first: "$chain.parent_hash",
                                    },
                                    block_number: {
                                        $first: "$chain.block_number",
                                    },
                                    block_hash: {
                                        $first: "$chain.block_hash",
                                    },
                                    chain_id: {
                                        $first: "$chain.chain_id",
                                    },
                                    network_name: {
                                        $first: "$chain.network_name",
                                    },
                                },
                            },
                            {
                                $sort: { block_number: 1 },
                            },
                        ])];
                    case 1:
                        related_blocks = _a.sent();
                        if (related_blocks[0].block_number > first_block) {
                            return [2 /*return*/, related_blocks[0].parent_hash];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    ChainStore.prototype.evict_if_necessary = function () {
        return __awaiter(this, void 0, void 0, function () {
            var cached_length;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.redis_client.llen(this.CACHED_KEY)];
                    case 1:
                        cached_length = _a.sent();
                        if (!(cached_length && cached_length > this.capacity)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.redis_client.lpop(this.CACHED_KEY)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return ChainStore;
}());
exports.ChainStore = ChainStore;
