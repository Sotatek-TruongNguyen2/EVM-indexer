"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChainHeadStore = exports.ChainStoreSchema = void 0;
var mongoose_1 = __importDefault(require("mongoose"));
exports.ChainStoreSchema = new mongoose_1.default.Schema({
    head_block_hash: {
        type: String,
        required: true,
    },
    head_block_number: {
        type: Number,
        required: true,
    },
    network_name: {
        type: String,
        required: true,
    },
    chain_id: {
        type: Number,
        required: true,
    },
});
exports.ChainHeadStore = mongoose_1.default.model("ChainStore", exports.ChainStoreSchema);
