"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserDataTrie = exports.UserDataTrieSchema = void 0;
var mongoose_1 = __importDefault(require("mongoose"));
exports.UserDataTrieSchema = new mongoose_1.default.Schema({
    _id: {
        type: Number,
        required: true,
    },
    trie: {
        type: Object,
    },
});
exports.UserDataTrie = mongoose_1.default.model("UserDataTrie", exports.UserDataTrieSchema);
