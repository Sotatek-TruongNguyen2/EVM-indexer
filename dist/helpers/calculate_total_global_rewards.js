"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculate_total_global_rewards = void 0;
var bignumber_js_1 = __importDefault(require("bignumber.js"));
// 365 days
var SECONDS_IN_YEAR_IN_SECONDS = 365 * 86400;
// const ACCUMULATIVE_PRECISION = 1e18;
var calculate_total_global_rewards = function (accumulative_index, total_global_reward, global_interest_rate, last_accrued_timestamp, current_timestamp) {
    // const current_day_unix = Math.floor(Date.now() / 1000);
    if (new bignumber_js_1.default(global_interest_rate).eq(new bignumber_js_1.default(0))) {
        return {
            total_global_reward: total_global_reward,
            last_accrued_timestamp: current_timestamp,
        };
    }
    var pending_rewards = new bignumber_js_1.default(current_timestamp - last_accrued_timestamp)
        .multipliedBy(accumulative_index)
        .multipliedBy(global_interest_rate)
        .div(SECONDS_IN_YEAR_IN_SECONDS)
        .div(10000);
    // .div(ACCUMULATIVE_PRECISION);
    // .toFixed();
    // global_interest_rate;
    return {
        total_global_reward: new bignumber_js_1.default(total_global_reward)
            .plus(pending_rewards)
            .toString(),
        last_accrued_timestamp: current_timestamp,
    };
};
exports.calculate_total_global_rewards = calculate_total_global_rewards;
