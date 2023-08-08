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
exports.IndexForward = void 0;
var pubsub_js_1 = __importDefault(require("pubsub-js"));
var ethers_1 = require("ethers");
var chainConfig_1 = require("../../../config/chainConfig");
var logger_1 = require("../../../utils/logger");
var rpcRequest_1 = require("../../../utils/rpcRequest");
var indexer_1 = require("../../../config/indexer");
var contract_deployment_store_1 = require("../../store/contract_deployment_store");
var retry_1 = require("../../retry");
var timeout_1 = require("../../../utils/timeout");
var ETHAdapter_1 = require("../../adapters/eth/ETHAdapter");
var types_1 = require("../types");
var handlers_1 = require("../../handlers");
var errors_1 = require("../../errors");
var filters_1 = require("../../filters");
var topics_1 = require("../../pubsub/topics");
var IndexForward = /** @class */ (function () {
    function IndexForward(deployment, chain_store) {
        var indexer_config = indexer_1.IndexerConfig.getInstance();
        this._chain_store = chain_store;
        this._index_state = { state: types_1.BlockStreamState.BeginReconciliation };
        this._consecutive_err_count = 0;
        this._target_triggers_per_block_range =
            indexer_config.TARGET_TRIGGERS_PER_BLOCK_RANGE;
        this._previous_triggers_per_block = indexer_1.STARTING_PREVIOUS_TRIGGERS_PER_BLOCK;
        this._previous_block_range_size = 1;
        this._max_block_range_size = indexer_config.ETHEREUM_MAX_BLOCK_RANGE_SIZE;
        this._block_polling_interval = indexer_config.NEW_BLOCK_POLLING_INTERVAL;
        this._deployment = deployment;
        this._adapter = new ETHAdapter_1.ETHAdapter(deployment.chain_id, this.chain_store);
        var chainConfig = chainConfig_1.ChainConfig[this.deployment.chain_id];
        this._logger = (0, logger_1.getIndexerLogger)("".concat(chainConfig.name, "_").concat(deployment.deployment, "_").concat(IndexForward.name));
    }
    Object.defineProperty(IndexForward.prototype, "deployment_latest_block", {
        get: function () {
            return this._deployment_latest_block;
        },
        set: function (deployment_latest_block) {
            this._deployment_latest_block = deployment_latest_block;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(IndexForward.prototype, "max_block_range_size", {
        get: function () {
            return this._max_block_range_size;
        },
        set: function (max_block_range_size) {
            this._max_block_range_size = max_block_range_size;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(IndexForward.prototype, "previous_triggers_per_block", {
        get: function () {
            return this._previous_triggers_per_block;
        },
        set: function (previous_triggers_per_block) {
            this._previous_triggers_per_block = previous_triggers_per_block;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(IndexForward.prototype, "previous_block_range_size", {
        get: function () {
            return this._previous_block_range_size;
        },
        set: function (_previous_block_range_size) {
            this._previous_block_range_size = _previous_block_range_size;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(IndexForward.prototype, "index_state", {
        get: function () {
            return this._index_state;
        },
        set: function (index_state) {
            this._index_state = index_state;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(IndexForward.prototype, "consecutive_err_count", {
        get: function () {
            return this._consecutive_err_count;
        },
        set: function (consecutive_err_count) {
            this._consecutive_err_count = consecutive_err_count;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(IndexForward.prototype, "chain_head_emitter", {
        get: function () {
            return this._chain_head_emitter;
        },
        set: function (chain_head_emitter) {
            this._chain_head_emitter = chain_head_emitter;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(IndexForward.prototype, "chain_store", {
        get: function () {
            return this._chain_store;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(IndexForward.prototype, "adapter", {
        get: function () {
            return this._adapter;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(IndexForward.prototype, "block_polling_interval", {
        get: function () {
            return this._block_polling_interval;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(IndexForward.prototype, "logger", {
        get: function () {
            return this._logger;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(IndexForward.prototype, "deployment", {
        get: function () {
            return this._deployment;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(IndexForward.prototype, "target_triggers_per_block_range", {
        get: function () {
            return this._target_triggers_per_block_range;
        },
        enumerable: false,
        configurable: true
    });
    IndexForward.prototype.get_next_step = function () {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var indexer_config, chainConfig, chain_head_ptr, _c, from, is_on_main_chain, parent_ptr, to_limit, range_size_upper_limit, range_size, to, blocks, offset, ancestor_block, block, parent_ptr;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        indexer_config = indexer_1.IndexerConfig.getInstance();
                        chainConfig = chainConfig_1.ChainConfig[this.deployment.chain_id];
                        if (!chainConfig) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.chain_store.chain_head_ptr()];
                    case 1:
                        chain_head_ptr = _d.sent();
                        if (!chain_head_ptr) {
                            return [2 /*return*/, {
                                    state: types_1.ReconciliationStep.Done,
                                }];
                        }
                        if (!!this.deployment_latest_block) return [3 /*break*/, 3];
                        _c = this;
                        return [4 /*yield*/, (0, contract_deployment_store_1.get_deployment_latest_block)(this.deployment.id)];
                    case 2:
                        _c.deployment_latest_block = _d.sent();
                        _d.label = 3;
                    case 3:
                        this.logger.debug("Deployment ".concat(this.deployment.deployment, " Latest Block: ").concat((_a = this.deployment_latest_block) === null || _a === void 0 ? void 0 : _a.number));
                        // Subgraph ptr is behind head ptr.
                        // Let's try to move the subgraph ptr one step in the right direction.
                        // First question: which direction should the ptr be moved?
                        //
                        // We will use a different approach to deciding the step direction depending on how far
                        // the subgraph ptr is behind the head ptr.
                        //
                        // Normally, we need to worry about chain reorganizations -- situations where the
                        // Ethereum client discovers a new longer chain of blocks different from the one we had
                        // processed so far, forcing us to rollback one or more blocks we had already
                        // processed.
                        // We can't assume that blocks we receive are permanent.
                        //
                        // However, as a block receives more and more confirmations, eventually it becomes safe
                        // to assume that that block will be permanent.
                        // The probability of a block being "uncled" approaches zero as more and more blocks
                        // are chained on after that block.
                        // Eventually, the probability is so low, that a block is effectively permanent.
                        // The "effectively permanent" part is what makes blockchains useful.
                        // See here for more discussion:
                        // https://blog.ethereum.org/2016/05/09/on-settlement-finality/
                        //
                        // Accordingly, if the subgraph ptr is really far behind the head ptr, then we can
                        // trust that the Ethereum node knows what the real, permanent block is for that block
                        // number.
                        // We'll define "really far" to mean "greater than reorg_threshold blocks".
                        //
                        // If the subgraph ptr is not too far behind the head ptr (i.e. less than
                        // reorg_threshold blocks behind), then we have to allow for the possibility that the
                        // block might be on the main chain now, but might become uncled in the future.
                        //
                        // Most importantly: Our ability to make this assumption (or not) will determine what
                        // Ethereum RPC calls can give us accurate data without race conditions.
                        // (This is mostly due to some unfortunate API design decisions on the Ethereum side)
                        if (this.deployment_latest_block &&
                            this.deployment_latest_block.number >= chain_head_ptr.number) {
                            return [2 /*return*/, { state: types_1.ReconciliationStep.Done }];
                        }
                        from = this.deployment_latest_block
                            ? this.deployment_latest_block.number + 1
                            : 0;
                        if (!(!this.deployment_latest_block ||
                            chain_head_ptr.number - this.deployment_latest_block.number >
                                indexer_config.REORG_THRESHOLD)) return [3 /*break*/, 8];
                        is_on_main_chain = true;
                        if (!this.deployment_latest_block) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.adapter.is_on_main_chain(this.deployment_latest_block)];
                    case 4:
                        is_on_main_chain = _d.sent();
                        _d.label = 5;
                    case 5:
                        if (!is_on_main_chain) {
                            parent_ptr = this.parent_ptr(this.deployment_latest_block);
                            return [2 /*return*/, {
                                    state: types_1.ReconciliationStep.Revert,
                                    data: parent_ptr,
                                }];
                        }
                        to_limit = chain_head_ptr.number - indexer_config.REORG_THRESHOLD;
                        range_size_upper_limit = Math.min(this.max_block_range_size, this.previous_block_range_size * 10);
                        range_size = range_size_upper_limit;
                        if (this.previous_triggers_per_block != 0) {
                            range_size = Math.min(Math.max(Math.floor(this.target_triggers_per_block_range /
                                this.previous_triggers_per_block), 1), range_size_upper_limit);
                        }
                        to = Math.min(from + range_size - 1, to_limit);
                        this.logger.debug("Scanning blocks [".concat(from, ", ").concat(to, "]\" <-> range_size => ").concat(range_size));
                        if (!(this.deployment.contract && this.deployment.filters)) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.scan_triggers(this.deployment.contract, from, to, this.deployment.filters)];
                    case 6:
                        blocks = _d.sent();
                        return [2 /*return*/, {
                                state: types_1.ReconciliationStep.ProcessDescendantBlocks,
                                data: {
                                    blocks_with_triggers: blocks,
                                    range_size: range_size,
                                },
                            }];
                    case 7: return [3 /*break*/, 13];
                    case 8:
                        // console.log("START RUNNING INTO ANCESTOR");
                        // The subgraph ptr is not too far behind the head ptr.
                        // This means a few things.
                        //
                        // First, because we are still within the reorg threshold,
                        // we can't trust the Ethereum RPC methods that use block numbers.
                        // Block numbers in this region are not yet immutable pointers to blocks;
                        // the block associated with a particular block number on the Ethereum node could
                        // change under our feet at any time.
                        //
                        // Second, due to how the BlockIngestor is designed, we get a helpful guarantee:
                        // the head block and at least its reorg_threshold most recent ancestors will be
                        // present in the block store.
                        // This allows us to work locally in the block store instead of relying on
                        // Ethereum RPC calls, so that we are not subject to the limitations of the RPC
                        // API.
                        // To determine the step direction, we need to find out if the subgraph ptr refers
                        // to a block that is an ancestor of the head block.
                        // We can do so by walking back up the chain from the head block to the appropriate
                        // block number, and checking to see if the block we found matches the
                        // subgraph_ptr.
                        if (!this.deployment_latest_block) {
                            this.logger.debug("indexer block pointer should not be `Null` here");
                            return [2 /*return*/];
                        }
                        offset = chain_head_ptr.number - this.deployment_latest_block.number - 1;
                        return [4 /*yield*/, this.chain_store.ancestor_block({
                                hash: chain_head_ptr.hash,
                                number: chain_head_ptr.number,
                            }, offset)];
                    case 9:
                        ancestor_block = _d.sent();
                        // console.log(offset, this.deployment_latest_block, ancestor_block);
                        if (!ancestor_block) {
                            // Block is missing in the block store.
                            // This generally won't happen often, but can happen if the head ptr has
                            // been updated since we retrieved the head ptr, and the block store has
                            // been garbage collected.
                            // It's easiest to start over at this point.
                            return [2 /*return*/, {
                                    state: types_1.ReconciliationStep.Retry,
                                }];
                        }
                        if (!((ancestor_block === null || ancestor_block === void 0 ? void 0 : ancestor_block.parent_hash) === ((_b = this.deployment_latest_block) === null || _b === void 0 ? void 0 : _b.hash))) return [3 /*break*/, 11];
                        return [4 /*yield*/, this.block_with_triggers(ancestor_block, this.deployment.filters)];
                    case 10:
                        block = _d.sent();
                        return [2 /*return*/, {
                                state: types_1.ReconciliationStep.ProcessDescendantBlocks,
                                data: {
                                    range_size: 1,
                                    blocks_with_triggers: [block],
                                },
                            }];
                    case 11: return [4 /*yield*/, this.parent_ptr(this.deployment_latest_block)];
                    case 12:
                        parent_ptr = _d.sent();
                        return [2 /*return*/, {
                                state: types_1.ReconciliationStep.Revert,
                                data: parent_ptr,
                            }];
                    case 13: return [2 /*return*/];
                }
            });
        });
    };
    IndexForward.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () {
            var state, previous_state, _a, next_blocks, next_blocks, _b, range_size, blocks_with_triggers, total_triggers, data, next_blocks, blocks_with_triggers, blocks_with_triggers_1, blocks_with_triggers_1_1, block_with_triggers, e_1_1, err_1;
            var e_1, _c;
            var _this = this;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 17, , 19]);
                        state = this.index_state.state;
                        previous_state = state;
                        _a = state;
                        switch (_a) {
                            case types_1.BlockStreamState.BeginReconciliation: return [3 /*break*/, 1];
                            case types_1.BlockStreamState.Reconciliation: return [3 /*break*/, 3];
                            case types_1.BlockStreamState.YieldingBlocks: return [3 /*break*/, 4];
                            case types_1.BlockStreamState.RetryAfterDelay: return [3 /*break*/, 14];
                            case types_1.BlockStreamState.Idle: return [3 /*break*/, 15];
                        }
                        return [3 /*break*/, 16];
                    case 1:
                        if (this.chain_head_emitter) {
                            pubsub_js_1.default.unsubscribe(this.chain_head_emitter);
                            this.chain_head_emitter = null;
                        }
                        return [4 /*yield*/, this.next_blocks()];
                    case 2:
                        next_blocks = _d.sent();
                        this.index_state = {
                            state: types_1.BlockStreamState.Reconciliation,
                            next_blocks: next_blocks,
                        };
                        return [3 /*break*/, 16];
                    case 3:
                        {
                            next_blocks = this.index_state.next_blocks;
                            if (next_blocks) {
                                switch (next_blocks.state) {
                                    case types_1.NextBlockReturnsState.NextBlocks: {
                                        if (next_blocks.data) {
                                            _b = next_blocks.data, range_size = _b.range_size, blocks_with_triggers = _b.blocks_with_triggers;
                                            // We had only one error, so we infer that reducing the range size is
                                            // what fixed it. Reduce the max range size to prevent future errors.
                                            // See: 018c6df4-132f-4acc-8697-a2d64e83a9f0
                                            if (this.consecutive_err_count == 1) {
                                                // Reduce the max range size by 10%, but to no less than 10.
                                                this.max_block_range_size = Math.max((this.max_block_range_size * 9) / 10, 10);
                                            }
                                            this.consecutive_err_count = 0;
                                            total_triggers = blocks_with_triggers.reduce(function (total, block) { return total + block.triggers.length; }, 0);
                                            this.previous_triggers_per_block =
                                                total_triggers / range_size;
                                            this.previous_block_range_size = range_size;
                                            if (total_triggers > 0) {
                                                this.logger.debug("Processing ".concat(total_triggers, " triggers"));
                                            }
                                            this.index_state = {
                                                state: types_1.BlockStreamState.YieldingBlocks,
                                                next_blocks: next_blocks,
                                            };
                                        }
                                        break;
                                    }
                                    case types_1.NextBlockReturnsState.Done: {
                                        // Reset error count
                                        this.consecutive_err_count = 0;
                                        // Switch to idle
                                        this.index_state = {
                                            state: types_1.BlockStreamState.Idle,
                                        };
                                        // Poll for chain head update
                                        break;
                                    }
                                    case types_1.NextBlockReturnsState.Revert: {
                                        if (next_blocks.data) {
                                            data = next_blocks.data;
                                            this.index_state = {
                                                state: types_1.BlockStreamState.BeginReconciliation,
                                            };
                                            this.deployment_latest_block = {
                                                number: data.number,
                                                hash: data.hash,
                                            };
                                        }
                                        break;
                                    }
                                }
                            }
                            // } catch (err: any) {
                            //   this.logger.warn(err.message);
                            //   this.consecutive_err_count += 1;
                            //   this.previous_triggers_per_block =
                            //     STARTING_PREVIOUS_TRIGGERS_PER_BLOCK;
                            //   await wait(Math.max(120, 5 * this.consecutive_err_count) * 1000);
                            //   this.index_state = {
                            //     state: BlockStreamState.RetryAfterDelay,
                            //   };
                            // }
                        }
                        _d.label = 4;
                    case 4:
                        next_blocks = this.index_state.next_blocks;
                        if (!(next_blocks === null || next_blocks === void 0 ? void 0 : next_blocks.data)) return [3 /*break*/, 13];
                        blocks_with_triggers = next_blocks.data.blocks_with_triggers;
                        _d.label = 5;
                    case 5:
                        _d.trys.push([5, 10, 11, 12]);
                        blocks_with_triggers_1 = __values(blocks_with_triggers), blocks_with_triggers_1_1 = blocks_with_triggers_1.next();
                        _d.label = 6;
                    case 6:
                        if (!!blocks_with_triggers_1_1.done) return [3 /*break*/, 9];
                        block_with_triggers = blocks_with_triggers_1_1.value;
                        this.deployment_latest_block = {
                            number: ethers_1.BigNumber.from(block_with_triggers.block.block_number).toNumber(),
                            hash: block_with_triggers.block.block_hash,
                        };
                        return [4 /*yield*/, this.process_block(block_with_triggers)];
                    case 7:
                        _d.sent();
                        _d.label = 8;
                    case 8:
                        blocks_with_triggers_1_1 = blocks_with_triggers_1.next();
                        return [3 /*break*/, 6];
                    case 9: return [3 /*break*/, 12];
                    case 10:
                        e_1_1 = _d.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 12];
                    case 11:
                        try {
                            if (blocks_with_triggers_1_1 && !blocks_with_triggers_1_1.done && (_c = blocks_with_triggers_1.return)) _c.call(blocks_with_triggers_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                        return [7 /*endfinally*/];
                    case 12:
                        this.index_state = {
                            state: types_1.BlockStreamState.BeginReconciliation,
                        };
                        _d.label = 13;
                    case 13: return [3 /*break*/, 16];
                    case 14:
                        {
                            this.index_state = {
                                state: types_1.BlockStreamState.BeginReconciliation,
                            };
                            return [3 /*break*/, 16];
                        }
                        _d.label = 15;
                    case 15:
                        {
                            this.chain_head_emitter = pubsub_js_1.default.subscribe(topics_1.Topics.CHAIN_HEAD_STORE_UPDATE, function (msg, data) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    if (msg === topics_1.Topics.CHAIN_HEAD_STORE_UPDATE && data) {
                                        this.index_state = {
                                            state: types_1.BlockStreamState.BeginReconciliation,
                                        };
                                        this.start();
                                    }
                                    return [2 /*return*/];
                                });
                            }); });
                            return [3 /*break*/, 16];
                        }
                        _d.label = 16;
                    case 16:
                        if (this.index_state.state != types_1.BlockStreamState.Idle ||
                            (this.index_state.state == types_1.BlockStreamState.Idle &&
                                previous_state != types_1.BlockStreamState.Idle)) {
                            this.start();
                        }
                        return [3 /*break*/, 19];
                    case 17:
                        err_1 = _d.sent();
                        this.logger.warn(err_1.message);
                        this.consecutive_err_count += 1;
                        this.previous_triggers_per_block = indexer_1.STARTING_PREVIOUS_TRIGGERS_PER_BLOCK;
                        return [4 /*yield*/, (0, timeout_1.wait)(Math.max(120, 5 * this.consecutive_err_count) * 1000)];
                    case 18:
                        _d.sent();
                        this.index_state = {
                            state: types_1.BlockStreamState.RetryAfterDelay,
                        };
                        this.start();
                        return [3 /*break*/, 19];
                    case 19: return [2 /*return*/];
                }
            });
        });
    };
    IndexForward.prototype.scan_triggers = function (contract, from, to, filters) {
        return __awaiter(this, void 0, void 0, function () {
            var indexer_config, log_filters, filter, logs, _loop_1, this_1, log_filters_1, log_filters_1_1, filter_1, e_2_1, block_hashes, to_hash, err_2, blocks, triggers_by_block, blocks_with_logs, blocks_with_triggers;
            var e_2, _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        indexer_config = indexer_1.IndexerConfig.getInstance();
                        log_filters = [];
                        filter = filters_1.EthGetLogsFilter.from_contract(contract);
                        Object.keys(filters).map(function (event_sig) {
                            filter.event_signatures.push("".concat(String(event_sig)));
                        });
                        log_filters.push(filter);
                        if (from > to) {
                            this.logger.debug("cannot produce a log stream on a backwards block range (from=".concat(ethers_1.BigNumber.from(from).toNumber(), ", to=").concat(ethers_1.BigNumber.from(to).toNumber(), ")"));
                            return [2 /*return*/];
                        }
                        logs = [];
                        _loop_1 = function (filter_1) {
                            var step, start, get_logs, log_triggers;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        step = to - from;
                                        if (filter_1.contracts.length == 0) {
                                            step = Math.min(to - from, indexer_config.ETHEREUM_MAX_EVENT_ONLY_RANGE - 1);
                                        }
                                        start = from;
                                        _c.label = 1;
                                    case 1:
                                        if (!(start <= to)) return [3 /*break*/, 3];
                                        get_logs = function (start, end) { return function () { return __awaiter(_this, void 0, void 0, function () {
                                            var start_calling, result, elapsed;
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0:
                                                        start_calling = Date.now();
                                                        return [4 /*yield*/, (0, rpcRequest_1.callRPCRawMethod)(this.deployment.chain_id, "eth_getLogs", [
                                                                {
                                                                    fromBlock: "0x".concat(start.toString(16)),
                                                                    toBlock: "0x".concat(end.toString(16)),
                                                                    topics: [__spreadArray([], __read(filter_1.event_signatures), false)],
                                                                    address: filter_1.contracts,
                                                                },
                                                            ], this.logger)];
                                                    case 1:
                                                        result = _a.sent();
                                                        elapsed = Date.now() - start_calling;
                                                        this.logger.info("Requesting logs for blocks [".concat(start, ", ").concat(end, "], ").concat(JSON.stringify(filter_1), " elapsed ").concat(elapsed));
                                                        return [2 /*return*/, result];
                                                }
                                            });
                                        }); }; };
                                        return [4 /*yield*/, this_1.requesting_logs_in_range(get_logs, start, to, step, filters)];
                                    case 2:
                                        log_triggers = _c.sent();
                                        start = log_triggers.start;
                                        step = log_triggers.step;
                                        logs.push.apply(logs, __spreadArray([], __read(log_triggers.logs), false));
                                        return [3 /*break*/, 1];
                                    case 3: return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 6, 7, 8]);
                        log_filters_1 = __values(log_filters), log_filters_1_1 = log_filters_1.next();
                        _b.label = 2;
                    case 2:
                        if (!!log_filters_1_1.done) return [3 /*break*/, 5];
                        filter_1 = log_filters_1_1.value;
                        return [5 /*yield**/, _loop_1(filter_1)];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4:
                        log_filters_1_1 = log_filters_1.next();
                        return [3 /*break*/, 2];
                    case 5: return [3 /*break*/, 8];
                    case 6:
                        e_2_1 = _b.sent();
                        e_2 = { error: e_2_1 };
                        return [3 /*break*/, 8];
                    case 7:
                        try {
                            if (log_filters_1_1 && !log_filters_1_1.done && (_a = log_filters_1.return)) _a.call(log_filters_1);
                        }
                        finally { if (e_2) throw e_2.error; }
                        return [7 /*endfinally*/];
                    case 8:
                        block_hashes = new Set(logs.map(function (log) { return log.blockHash; }));
                        _b.label = 9;
                    case 9:
                        _b.trys.push([9, 11, , 12]);
                        return [4 /*yield*/, this.adapter.get_block_hash_by_block_number(to)];
                    case 10:
                        to_hash = _b.sent();
                        block_hashes.add(to_hash);
                        return [3 /*break*/, 12];
                    case 11:
                        err_2 = _b.sent();
                        this.logger.warn("\"Block {} not found in the chain\", ".concat(to, ")"));
                        return [3 /*break*/, 12];
                    case 12:
                        this.logger.info("Found ".concat(block_hashes.size, " relevant block(s)"));
                        return [4 /*yield*/, this.adapter.load_blocks(Array.from(block_hashes), this.chain_store)];
                    case 13:
                        blocks = _b.sent();
                        triggers_by_block = new Map();
                        blocks_with_logs = new Map();
                        blocks.forEach(function (block) {
                            if (!blocks_with_logs.get(block.block_number)) {
                                blocks_with_logs.set(block.block_number, block.data.logs);
                            }
                        });
                        logs.forEach(function (log) {
                            var log_block_number = Number(log.blockNumber);
                            if (!triggers_by_block.get(log_block_number)) {
                                triggers_by_block.set(log_block_number, []);
                            }
                            if (blocks_with_logs.get(log_block_number)) {
                                triggers_by_block.set(log_block_number, __spreadArray(__spreadArray([], __read(triggers_by_block.get(log_block_number)), false), [
                                    blocks_with_logs.get(log_block_number)[Number(log.logIndex)],
                                ], false));
                            }
                        });
                        blocks_with_triggers = blocks.map(function (block) {
                            var triggers = triggers_by_block.get(block.block_number);
                            if (!triggers) {
                                _this.logger.debug("block ".concat(ethers_1.BigNumber.from(block.block_number).toString(), " not found in `triggers_by_block`"));
                                return {
                                    block: block,
                                    triggers: [],
                                };
                            }
                            return {
                                block: block,
                                triggers: triggers,
                            };
                        });
                        blocks_with_triggers = blocks_with_triggers.sort(function (first, sec) { return first.block.block_number - sec.block.block_number; });
                        return [2 /*return*/, blocks_with_triggers];
                }
            });
        });
    };
    IndexForward.prototype.requesting_logs_in_range = function (cb, start, to, step, filters) {
        return __awaiter(this, void 0, void 0, function () {
            var end, retry_log_message, retry, err_3, new_step;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        end = Math.min(start + step, to);
                        this.logger.info("Requesting logs for blocks [".concat(start, ", ").concat(end, "], ").concat(JSON.stringify(filters)));
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        retry_log_message = "eth_getLogs RPC call for block range: [".concat(start, "..").concat(end, "]");
                        retry = new retry_1.RetryConfig(retry_log_message, this.logger, errors_1.TOO_MANY_LOGS_FINGERPRINTS);
                        _a = {};
                        return [4 /*yield*/, retry.run(cb(start, end)())];
                    case 2: return [2 /*return*/, (_a.logs = _b.sent(), _a.start = end + 1, _a.step = step, _a)];
                    case 3:
                        err_3 = _b.sent();
                        // console.log(err.message);
                        if (err_3.name === "RequestLimitErr" && step > 0) {
                            new_step = step / 10;
                            this.logger.info("Reducing block range size to scan for events, new_size ".concat(new_step + 1));
                            return [2 /*return*/, this.requesting_logs_in_range(cb, start, to, new_step, filters)];
                        }
                        else if (err_3.name === "IntolerantErr") {
                            this.logger.warn("Unexpected RPC error: ".concat(err_3.inner));
                            throw err_3;
                        }
                        this.logger.warn("Have no idea what error it is !!!");
                        return [2 /*return*/, { logs: [], start: start, step: step }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    IndexForward.prototype.next_blocks = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!true) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.get_next_step()];
                    case 1:
                        result = _a.sent();
                        switch (result === null || result === void 0 ? void 0 : result.state) {
                            case types_1.ReconciliationStep.ProcessDescendantBlocks: {
                                return [2 /*return*/, {
                                        state: types_1.NextBlockReturnsState.NextBlocks,
                                        data: result.data,
                                    }];
                            }
                            case types_1.ReconciliationStep.Done: {
                                return [2 /*return*/, { state: types_1.NextBlockReturnsState.Done }];
                            }
                            case types_1.ReconciliationStep.Retry: {
                                return [3 /*break*/, 0];
                            }
                            case types_1.ReconciliationStep.Revert: {
                                return [2 /*return*/, {
                                        state: types_1.NextBlockReturnsState.Revert,
                                        data: result.data,
                                    }];
                            }
                        }
                        return [3 /*break*/, 0];
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    IndexForward.prototype.process_block = function (block_with_triggers) {
        return __awaiter(this, void 0, void 0, function () {
            var close_to_chain_head, handlers, _a, _b, trigger, handler_sig, handler, start_time, elapsed, err_4, e_3_1;
            var e_3, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, this.close_to_chain_head(1)];
                    case 1:
                        close_to_chain_head = _d.sent();
                        if (!(close_to_chain_head && !this.deployment.synced)) return [3 /*break*/, 3];
                        return [4 /*yield*/, (0, contract_deployment_store_1.set_synced)(this.deployment.id, true)];
                    case 2:
                        _d.sent();
                        _d.label = 3;
                    case 3:
                        this.logger.info("".concat(block_with_triggers.triggers.length, " candidate trigger in this block"));
                        if (!(block_with_triggers.triggers.length > 0)) return [3 /*break*/, 13];
                        handlers = this.deployment.handlers;
                        _d.label = 4;
                    case 4:
                        _d.trys.push([4, 11, 12, 13]);
                        _a = __values(block_with_triggers.triggers), _b = _a.next();
                        _d.label = 5;
                    case 5:
                        if (!!_b.done) return [3 /*break*/, 10];
                        trigger = _b.value;
                        handler_sig = handlers.get(trigger.topics[0]);
                        if (!handler_sig) return [3 /*break*/, 9];
                        handler = (0, handlers_1.getHandlerByName)(handler_sig);
                        this.logger.info("Start processing trigger, handler => ".concat(handler_sig));
                        start_time = new Date().getTime();
                        _d.label = 6;
                    case 6:
                        _d.trys.push([6, 8, , 9]);
                        return [4 /*yield*/, handler(this.logger, {
                                raw_log: trigger,
                                metadata: {
                                    timestamp: block_with_triggers.block.timestamp,
                                    block_number: block_with_triggers.block.block_number,
                                },
                            })];
                    case 7:
                        _d.sent();
                        elapsed = new Date().getTime() - start_time;
                        this.logger.info("Done processing trigger, total_ms: ".concat(elapsed, ", handler: ").concat(handler_sig));
                        return [3 /*break*/, 9];
                    case 8:
                        err_4 = _d.sent();
                        this.logger.warn("Error when processing ".concat(handler.name, " => ").concat(err_4.message));
                        return [3 /*break*/, 9];
                    case 9:
                        _b = _a.next();
                        return [3 /*break*/, 5];
                    case 10: return [3 /*break*/, 13];
                    case 11:
                        e_3_1 = _d.sent();
                        e_3 = { error: e_3_1 };
                        return [3 /*break*/, 13];
                    case 12:
                        try {
                            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                        }
                        finally { if (e_3) throw e_3.error; }
                        return [7 /*endfinally*/];
                    case 13: return [4 /*yield*/, (0, contract_deployment_store_1.update_latest_ethereum_block)(this.deployment.id, {
                            number: block_with_triggers.block.block_number,
                            hash: block_with_triggers.block.block_hash,
                        })];
                    case 14:
                        _d.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    IndexForward.prototype.block_with_triggers = function (block, filter) {
        return __awaiter(this, void 0, void 0, function () {
            var blocks, triggers_1, block_data_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!block.finalized) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.scan_triggers(this.deployment.contract, block.block_number, block.block_number, filter)];
                    case 1:
                        blocks = _a.sent();
                        if (blocks && blocks.length === 1) {
                            return [2 /*return*/, blocks[0]];
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        triggers_1 = [];
                        block_data_1 = block.data;
                        Object.keys(filter).map(function (first_topic) {
                            var e_4, _a;
                            try {
                                for (var _b = __values(block_data_1.logs), _c = _b.next(); !_c.done; _c = _b.next()) {
                                    var log = _c.value;
                                    if (log.address === _this.deployment.contract &&
                                        log.topics[0] === first_topic) {
                                        triggers_1.push(log);
                                    }
                                }
                            }
                            catch (e_4_1) { e_4 = { error: e_4_1 }; }
                            finally {
                                try {
                                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                                }
                                finally { if (e_4) throw e_4.error; }
                            }
                        });
                        return [2 /*return*/, {
                                block: block,
                                triggers: triggers_1,
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    IndexForward.prototype.parent_ptr = function (block) {
        return __awaiter(this, void 0, void 0, function () {
            var blocks;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.adapter.load_blocks([block.hash], this.chain_store)];
                    case 1:
                        blocks = _a.sent();
                        if (blocks.length === 1) {
                            return [2 /*return*/, {
                                    number: blocks[0].block_number - 1,
                                    hash: blocks[0].parent_hash,
                                }];
                        }
                        throw new Error("Not found parent pointer for this block!!!");
                }
            });
        });
    };
    IndexForward.prototype.close_to_chain_head = function (n) {
        return __awaiter(this, void 0, void 0, function () {
            var chain_head_ptr, deployment_ptr;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.chain_store.cached_chain_head()];
                    case 1:
                        chain_head_ptr = _a.sent();
                        deployment_ptr = this.deployment_latest_block;
                        if (chain_head_ptr && deployment_ptr) {
                            return [2 /*return*/, chain_head_ptr.ptr.number - deployment_ptr.number <= n];
                        }
                        return [2 /*return*/, false];
                }
            });
        });
    };
    return IndexForward;
}());
exports.IndexForward = IndexForward;
