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
Object.defineProperty(exports, "__esModule", { value: true });
exports.save_contract_deployments = exports.get_deployment_latest_block = exports.get_all_deployments = exports.update_latest_ethereum_block = exports.set_synced = void 0;
var ethers_1 = require("ethers");
var contract_deployment_model_1 = require("../../models/contract-deployment.model");
var chainConfig_1 = require("../../config/chainConfig");
var logger_1 = require("../../utils/logger");
var indexer_1 = require("../../config/indexer");
var rpcRequest_1 = require("../../utils/rpcRequest");
var set_synced = function (deployment_id, synced) { return __awaiter(void 0, void 0, void 0, function () {
    var updated_row;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, contract_deployment_model_1.ContractDeployment.updateOne({
                    _id: { $eq: deployment_id },
                }, {
                    $set: {
                        synced: synced,
                    },
                }, {
                    new: true,
                })];
            case 1:
                updated_row = _a.sent();
                if (!updated_row) {
                    throw new Error("Deployment ID ".concat(deployment_id, " not found!"));
                }
                return [2 /*return*/];
        }
    });
}); };
exports.set_synced = set_synced;
var update_latest_ethereum_block = function (deployment_id, block) { return __awaiter(void 0, void 0, void 0, function () {
    var updated_row;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, contract_deployment_model_1.ContractDeployment.updateOne({
                    _id: { $eq: deployment_id },
                    $or: [
                        {
                            latest_ethereum_block_number: { $lt: block.number },
                        },
                        {
                            latest_ethereum_block_number: { $eq: null },
                        },
                    ],
                }, {
                    $set: {
                        latest_ethereum_block_hash: block.hash,
                        latest_ethereum_block_number: block.number,
                    },
                })];
            case 1:
                updated_row = _a.sent();
                // console.log("UPDATED ROW: ", updated_row);
                if (!updated_row) {
                    throw new Error("Deployment ID ".concat(deployment_id, " not found!"));
                }
                return [2 /*return*/];
        }
    });
}); };
exports.update_latest_ethereum_block = update_latest_ethereum_block;
var get_all_deployments = function () { return __awaiter(void 0, void 0, void 0, function () {
    var deployments;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, contract_deployment_model_1.ContractDeployment.find({})];
            case 1:
                deployments = _a.sent();
                return [2 /*return*/, deployments];
        }
    });
}); };
exports.get_all_deployments = get_all_deployments;
var get_deployment_latest_block = function (id) { return __awaiter(void 0, void 0, void 0, function () {
    var deployment;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, contract_deployment_model_1.ContractDeployment.findById(id)];
            case 1:
                deployment = _a.sent();
                if (!deployment) {
                    return [2 /*return*/];
                }
                return [2 /*return*/, {
                        hash: deployment.latest_ethereum_block_hash,
                        number: deployment.latest_ethereum_block_number,
                    }];
        }
    });
}); };
exports.get_deployment_latest_block = get_deployment_latest_block;
var save_contract_deployments = function () { return __awaiter(void 0, void 0, void 0, function () {
    var mongo_prepared_deployments, mongo_prepared_deployments_1, mongo_prepared_deployments_1_1, deployment, metadata, deployment_doc, logger, existing, start_block, err_1, e_1_1;
    var e_1, _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                mongo_prepared_deployments = [];
                Object.keys(chainConfig_1.ChainConfig).map(function (key) {
                    var _a = chainConfig_1.ChainConfig[key], deployments = _a.deployments, id = _a.id, name = _a.name;
                    deployments.map(function (deployment) {
                        var e_2, _a;
                        var logger = (0, logger_1.getIndexerLogger)("saveDeployment_".concat(name));
                        logger.debug("proceeding to process saving all instantiate contract deployments!");
                        var contract_deployment_hash = ethers_1.ethers.utils.keccak256(ethers_1.ethers.utils.toUtf8Bytes("".concat(id, "-").concat(deployment.contract, "-").concat(deployment.startBlock, "-").concat(deployment.oldestBlock, "-").concat(deployment.filters)));
                        console.log("hash: ", contract_deployment_hash);
                        logger.debug("proceeding to process saving contract deployment with ChainId = ".concat(id, ", Contract Address = ").concat(deployment.contract, ", Deployment Hash = ").concat(contract_deployment_hash));
                        var indexer_config = indexer_1.IndexerConfig.getInstance();
                        var start_block = {
                            hash: null,
                            number: null,
                        };
                        // override if we have GRAPH_START_BLOCK in the environment
                        if (indexer_config.GRAPH_START_BLOCK) {
                            var graph_start_block = indexer_config.GRAPH_START_BLOCK.split(":");
                            start_block = {
                                hash: graph_start_block[0],
                                number: Number(graph_start_block[1]),
                            };
                        }
                        var handler_mapping = new Map();
                        try {
                            for (var _b = __values(Object.keys(deployment.handlers)), _c = _b.next(); !_c.done; _c = _b.next()) {
                                var handler_topic = _c.value;
                                if (!handler_mapping.get(handler_topic)) {
                                    handler_mapping.set(handler_topic, deployment.handlers[handler_topic]);
                                }
                            }
                        }
                        catch (e_2_1) { e_2 = { error: e_2_1 }; }
                        finally {
                            try {
                                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                            }
                            finally { if (e_2) throw e_2.error; }
                        }
                        var contract_deployment = new contract_deployment_model_1.ContractDeployment({
                            non_fatal_errors: [],
                            chain_id: id,
                            contract: deployment.contract,
                            fatal_error: null,
                            latest_ethereum_block_hash: start_block === null || start_block === void 0 ? void 0 : start_block.hash,
                            latest_ethereum_block_number: start_block === null || start_block === void 0 ? void 0 : start_block.number,
                            // oldest_ethereum_block_number: null,
                            synced: false,
                            deployment: contract_deployment_hash,
                            filters: deployment.filters,
                            abi: deployment.abi,
                            handlers: handler_mapping,
                        });
                        mongo_prepared_deployments.push({
                            deployment_doc: contract_deployment,
                            metadata: {
                                id: id,
                                name: name,
                                contract: deployment.contract,
                                deployment_hash: contract_deployment_hash,
                                oldest_block: deployment.oldest_block,
                                start_block: deployment.start_block,
                            },
                        });
                    });
                });
                _b.label = 1;
            case 1:
                _b.trys.push([1, 12, 13, 14]);
                mongo_prepared_deployments_1 = __values(mongo_prepared_deployments), mongo_prepared_deployments_1_1 = mongo_prepared_deployments_1.next();
                _b.label = 2;
            case 2:
                if (!!mongo_prepared_deployments_1_1.done) return [3 /*break*/, 11];
                deployment = mongo_prepared_deployments_1_1.value;
                metadata = deployment.metadata, deployment_doc = deployment.deployment_doc;
                logger = (0, logger_1.getIndexerLogger)("saveDeployment_".concat(metadata.name));
                logger.debug("proceeding to process saving all instantiate contract deployments!");
                _b.label = 3;
            case 3:
                _b.trys.push([3, 9, , 10]);
                return [4 /*yield*/, contract_deployment_model_1.ContractDeployment.findOne({
                        deployment: metadata.deployment_hash,
                    })];
            case 4:
                existing = _b.sent();
                if (!!existing) return [3 /*break*/, 8];
                if (!metadata.start_block) return [3 /*break*/, 6];
                return [4 /*yield*/, (0, rpcRequest_1.callRPCMethod)(metadata.id, "getBlock", [
                        metadata.start_block - 1,
                    ])];
            case 5:
                start_block = _b.sent();
                deployment_doc.set("latest_ethereum_block_hash", start_block.hash);
                deployment_doc.set("latest_ethereum_block_number", ethers_1.BigNumber.from(start_block.number).toNumber());
                _b.label = 6;
            case 6: return [4 /*yield*/, deployment_doc.save()];
            case 7:
                _b.sent();
                logger.info("Saving contract deployment with ChainId = ".concat(metadata.id, ", Contract Address = ").concat(metadata.contract, " successfully!!! \uD83D\uDE01\uD83D\uDE01\uD83D\uDE01"));
                return [3 /*break*/, 10];
            case 8:
                logger.info("Contract deployment with deployment hash = ".concat(metadata.deployment_hash, " already existed!"));
                return [3 /*break*/, 10];
            case 9:
                err_1 = _b.sent();
                logger.error(err_1.message);
                logger.error("Failed to save contract deployment with deployment hash = ".concat(metadata.deployment_hash));
                return [3 /*break*/, 10];
            case 10:
                mongo_prepared_deployments_1_1 = mongo_prepared_deployments_1.next();
                return [3 /*break*/, 2];
            case 11: return [3 /*break*/, 14];
            case 12:
                e_1_1 = _b.sent();
                e_1 = { error: e_1_1 };
                return [3 /*break*/, 14];
            case 13:
                try {
                    if (mongo_prepared_deployments_1_1 && !mongo_prepared_deployments_1_1.done && (_a = mongo_prepared_deployments_1.return)) _a.call(mongo_prepared_deployments_1);
                }
                finally { if (e_1) throw e_1.error; }
                return [7 /*endfinally*/];
            case 14: return [2 /*return*/];
        }
    });
}); };
exports.save_contract_deployments = save_contract_deployments;
