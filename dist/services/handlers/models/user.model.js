"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.UserModelSchema = exports.BranchStaking = void 0;
var mongoose_1 = __importDefault(require("mongoose"));
var constants_1 = require("../constants");
exports.BranchStaking = new mongoose_1.default.Schema({
    total_staking: {
        type: String,
        required: true,
        default: "0",
    },
    // type: {
    //   type: String,
    //   enum: UserLevel,
    //   default: UserLevel.UNKNOWN,
    // },
}, { _id: false });
exports.UserModelSchema = new mongoose_1.default.Schema({
    _id: {
        type: String,
        required: true,
        index: {
            unique: true,
        },
    },
    // address: {
    //   type: String,
    //   required: true,
    //   index: {
    //     unique: true,
    //   },
    // },
    level: {
        type: String,
        enum: constants_1.UserLevel,
        default: constants_1.UserLevel.UNKNOWN,
    },
    referralBy: {
        type: String,
        required: true,
    },
    current_deposit: {
        type: String,
        required: true,
        default: "0",
    },
    branches: {
        type: Map,
        of: String,
        default: {},
    },
    interest_rate: {
        type: Number,
        required: true,
        default: 0,
    },
    global_interest_rate: {
        type: Number,
        required: true,
        default: 0,
    },
    accumulative_index: {
        type: Number,
        required: true,
        default: 0,
    },
    last_accrued_timestamp: {
        type: Number,
        required: true,
        default: 0,
    },
    total_global_reward: {
        type: String,
        required: true,
        default: 0,
    },
});
exports.UserModelSchema.methods.referralInvitationByLevel = function (level) {
    return this["F".concat(level)];
};
exports.User = mongoose_1.default.model("User", exports.UserModelSchema);
