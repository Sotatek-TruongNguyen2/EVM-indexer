"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EthereumBlocks = void 0;
var mongoose_1 = __importDefault(require("mongoose"));
var EthereumBlockSchema = new mongoose_1.default.Schema({
    finalized: {
        type: Boolean,
        required: true,
    },
    data: {
        type: Object,
        required: true,
    },
    block_hash: {
        type: String,
        required: true,
    },
    block_number: {
        type: Number,
        required: true,
    },
    timestamp: {
        type: Number,
        required: true,
    },
    parent_hash: {
        type: String,
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
exports.EthereumBlocks = mongoose_1.default.model("EthereumBlock", EthereumBlockSchema);
