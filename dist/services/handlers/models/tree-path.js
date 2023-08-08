"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserTreePath = exports.UserTreePathSchema = void 0;
var mongoose_1 = __importDefault(require("mongoose"));
exports.UserTreePathSchema = new mongoose_1.default.Schema({
    ancestor: {
        type: String,
        ref: "User",
    },
    descendant: {
        type: String,
        ref: "User",
    },
    path_length: {
        type: Number,
        require: true,
        default: 0,
    },
});
exports.UserTreePathSchema.index({ ancestor: 1, descendant: 1 }, { unique: true });
exports.UserTreePath = mongoose_1.default.model("UserTreePath", exports.UserTreePathSchema);
