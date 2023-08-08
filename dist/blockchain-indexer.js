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
exports.BlockchainIndexer = void 0;
// require("ts-node").register({});
var contract_deployment_store_1 = require("./services/store/contract_deployment_store");
var indexers_1 = require("./services/indexers");
var chain_head_store_1 = require("./services/store/chain_head_store");
var eth_1 = require("./services/block_ingestors/eth");
// import { Worker, isMainThrea/d, parentPort } from "worker_threads";
var BlockchainIndexer = /** @class */ (function () {
    function BlockchainIndexer() {
    }
    BlockchainIndexer.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () {
            var chain_store, deployments, block_ingestor, deployments_1, deployments_1_1, deployment, indexer, err_1;
            var e_1, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        // if (isMainThread) {
                        return [4 /*yield*/, (0, contract_deployment_store_1.save_contract_deployments)()];
                    case 1:
                        // if (isMainThread) {
                        _b.sent();
                        chain_store = new chain_head_store_1.ChainStore(97);
                        return [4 /*yield*/, (0, contract_deployment_store_1.get_all_deployments)()];
                    case 2:
                        deployments = _b.sent();
                        block_ingestor = new eth_1.BlockIngestor(97, chain_store);
                        block_ingestor.start();
                        try {
                            for (deployments_1 = __values(deployments), deployments_1_1 = deployments_1.next(); !deployments_1_1.done; deployments_1_1 = deployments_1.next()) {
                                deployment = deployments_1_1.value;
                                indexer = new indexers_1.EthereumIndexForward(deployment, chain_store);
                                indexer.start();
                            }
                        }
                        catch (e_1_1) { e_1 = { error: e_1_1 }; }
                        finally {
                            try {
                                if (deployments_1_1 && !deployments_1_1.done && (_a = deployments_1.return)) _a.call(deployments_1);
                            }
                            finally { if (e_1) throw e_1.error; }
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        err_1 = _b.sent();
                        console.log("Catching an error: ", err_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return BlockchainIndexer;
}());
exports.BlockchainIndexer = BlockchainIndexer;
