"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractDeployment = void 0;
var mongoose_1 = __importDefault(require("mongoose"));
var ContractDeploymentSchema = new mongoose_1.default.Schema({
    deployment: String,
    filters: {
        type: Object,
        required: true,
    },
    contract: {
        type: String,
        required: true,
    },
    chain_id: {
        type: Number,
        required: true,
    },
    latest_ethereum_block_hash: {
        type: String,
        required: false,
    },
    latest_ethereum_block_number: {
        type: Number,
        required: false,
    },
    handlers: {
        type: Map,
        of: String,
        required: true,
    },
    // oldest_ethereum_block_number: {
    //   type: Number,
    //   required: false,
    // },
    // oldest_ethereum_block_hash: {
    //   type: String,
    //   required: false,
    // },
    synced: Boolean,
    non_fatal_errors: [String],
    fatal_error: {
        type: String,
        required: false,
    },
});
exports.ContractDeployment = mongoose_1.default.model("ContractDeployment", ContractDeploymentSchema);
