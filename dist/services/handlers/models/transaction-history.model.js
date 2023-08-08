"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionHistory = exports.TransactionHistorySchema = void 0;
var mongoose_1 = __importDefault(require("mongoose"));
var ethers_1 = require("ethers");
var transaction_category_1 = require("../constants/transaction-category");
exports.TransactionHistorySchema = new mongoose_1.default.Schema({
    tx_hash: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        enum: transaction_category_1.TransactionCategory,
        default: transaction_category_1.TransactionCategory.UNKNOWN,
    },
    block_number: {
        type: Number,
        required: true,
    },
    timestamp: {
        type: Number,
        required: true,
    },
    user: {
        type: String,
        required: true,
    },
    sender: {
        type: String,
        required: true,
    },
    amount: {
        type: String,
        required: true,
    },
    referrer: {
        type: String,
        required: true,
        default: ethers_1.ethers.constants.AddressZero,
    },
});
exports.TransactionHistory = mongoose_1.default.model("TransactionHistory", exports.TransactionHistorySchema);
