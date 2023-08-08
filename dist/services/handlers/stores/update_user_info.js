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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
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
exports.update_user_branches = exports.update_referral_tree_path = exports.update_user_info = exports.retrieve_user = exports.retrieve_user_referral_descendants = void 0;
var ethers_1 = require("ethers");
var bignumber_js_1 = require("bignumber.js");
var user_model_1 = require("../models/user.model");
// import { IUser } from "../types/IUser";
var constants_1 = require("../constants");
var trie_1 = require("./trie");
var tree_path_1 = require("../models/tree-path");
var trie_2 = require("./trie");
var trie_3 = require("../models/trie");
var user_1 = require("../constants/user");
var calculate_total_global_rewards_1 = require("../../../helpers/calculate_total_global_rewards");
var retrieve_user_referral_descendants = function (user_addr) { return __awaiter(void 0, void 0, void 0, function () {
    var descendants;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, tree_path_1.UserTreePath.aggregate([
                    {
                        $match: {
                            ancestor: {
                                $eq: user_addr,
                            },
                        },
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "descendant",
                            foreignField: "_id",
                            as: "descendant",
                        },
                    },
                ])];
            case 1:
                descendants = _a.sent();
                return [2 /*return*/, descendants];
        }
    });
}); };
exports.retrieve_user_referral_descendants = retrieve_user_referral_descendants;
var retrieve_user = function (user_addr) { return __awaiter(void 0, void 0, void 0, function () {
    var current_user, inserted_user;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, user_model_1.User.findOne({
                    _id: {
                        $eq: user_addr,
                    },
                })];
            case 1:
                current_user = _a.sent();
                if (!!current_user) return [3 /*break*/, 5];
                inserted_user = new user_model_1.User({
                    _id: user_addr,
                    current_deposit: new bignumber_js_1.BigNumber(0).toString(),
                    referralBy: ethers_1.ethers.constants.AddressZero,
                    level: constants_1.UserLevel.UNKNOWN,
                });
                return [4 /*yield*/, inserted_user.save()];
            case 2:
                current_user = _a.sent();
                return [4 /*yield*/, tree_path_1.UserTreePath.updateOne({
                        $and: [{ ancestor: user_addr }, { descendant: user_addr }],
                    }, {
                        $set: {
                            ancestor: user_addr,
                            descendant: user_addr,
                        },
                    }, {
                        upsert: true,
                    })];
            case 3:
                _a.sent();
                return [4 /*yield*/, (0, trie_2.upsert_user_data)(user_addr)];
            case 4:
                _a.sent();
                _a.label = 5;
            case 5: return [2 /*return*/, current_user];
        }
    });
}); };
exports.retrieve_user = retrieve_user;
var update_user_info = function (user_address, amount, referralBy, old, withdraw) { return __awaiter(void 0, void 0, void 0, function () {
    var current_user, old_current_user, updated_current_deposit;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, exports.retrieve_user)(user_address)];
            case 1:
                current_user = _a.sent();
                old_current_user = Object.assign({}, current_user);
                if (!(current_user.referralBy === ethers_1.ethers.constants.AddressZero &&
                    referralBy != ethers_1.ethers.constants.AddressZero)) return [3 /*break*/, 4];
                return [4 /*yield*/, (0, exports.retrieve_user)(referralBy)];
            case 2:
                _a.sent();
                return [4 /*yield*/, (0, exports.update_referral_tree_path)(user_address, referralBy)];
            case 3:
                _a.sent();
                current_user.referralBy = referralBy;
                _a.label = 4;
            case 4:
                updated_current_deposit = withdraw
                    ? new bignumber_js_1.BigNumber(current_user.current_deposit).minus(new bignumber_js_1.BigNumber(amount).div(1e18))
                    : new bignumber_js_1.BigNumber(current_user.current_deposit).plus(new bignumber_js_1.BigNumber(amount).div(1e18));
                current_user.current_deposit = (updated_current_deposit.lte(0) ? new bignumber_js_1.BigNumber(0) : updated_current_deposit).toString();
                Object.keys(user_1.UserStakingInterest).map(function (staking_range) {
                    var _a = __read(staking_range.split("-"), 2), from = _a[0], to = _a[1];
                    if (new bignumber_js_1.BigNumber(current_user.current_deposit).gte(new bignumber_js_1.BigNumber(from)) &&
                        new bignumber_js_1.BigNumber(current_user.current_deposit).lt(new bignumber_js_1.BigNumber(to || Number.MAX_VALUE))) {
                        current_user.interest_rate = user_1.UserStakingInterest[staking_range];
                    }
                });
                return [4 /*yield*/, current_user.save()];
            case 5:
                _a.sent();
                return [2 /*return*/, old ? old_current_user._doc : current_user];
        }
    });
}); };
exports.update_user_info = update_user_info;
var update_referral_tree_path = function (user_addr, referrer) { return __awaiter(void 0, void 0, void 0, function () {
    var ancestor_descendants, referrer_ancestors, referrer_ancestors_1, referrer_ancestors_1_1, referrer_ancestor, path_length;
    var e_1, _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                ancestor_descendants = [];
                return [4 /*yield*/, tree_path_1.UserTreePath.find({
                        descendant: {
                            $eq: referrer,
                        },
                    })];
            case 1:
                referrer_ancestors = _b.sent();
                try {
                    for (referrer_ancestors_1 = __values(referrer_ancestors), referrer_ancestors_1_1 = referrer_ancestors_1.next(); !referrer_ancestors_1_1.done; referrer_ancestors_1_1 = referrer_ancestors_1.next()) {
                        referrer_ancestor = referrer_ancestors_1_1.value;
                        path_length = referrer_ancestor.path_length;
                        ancestor_descendants.push(new tree_path_1.UserTreePath({
                            path_length: path_length + 1,
                            ancestor: referrer_ancestor.ancestor,
                            descendant: user_addr,
                        }));
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (referrer_ancestors_1_1 && !referrer_ancestors_1_1.done && (_a = referrer_ancestors_1.return)) _a.call(referrer_ancestors_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                return [4 /*yield*/, tree_path_1.UserTreePath.insertMany(ancestor_descendants)];
            case 2:
                _b.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.update_referral_tree_path = update_referral_tree_path;
var update_user_branches = function (user, // Old user details
amount, timestamp) { return __awaiter(void 0, void 0, void 0, function () {
    var user_ancestors, user_data_trie, newest_current_user, trie, users_level_after_modify_1, _a, _b, _c, index, user_ancestor, ancestor, path_length, branches, accumulative_index, last_accrued_timestamp, total_global_reward, global_interest_rate, F1_branch_address, current_branch_staking, _d, updated_total_global_reward, updated_last_accrued_timestamp, current_level, updated_accumulative_index, ancestor_descendants, temp_accumulative_index, ancestor_descendants_1, ancestor_descendants_1_1, ancestor_descendant, descendant, accumulative_index_diff, user_global_referral_interest_rate, e_2_1;
    var e_2, _e, e_3, _f;
    return __generator(this, function (_g) {
        switch (_g.label) {
            case 0: return [4 /*yield*/, tree_path_1.UserTreePath.aggregate([
                    {
                        $match: {
                            $and: [
                                {
                                    descendant: user._id,
                                },
                                {
                                    $and: [
                                        {
                                            path_length: {
                                                $gte: 0,
                                            },
                                        },
                                        // {
                                        //   path_length: {
                                        //     $lte: 7,
                                        //   },
                                        // },
                                    ],
                                },
                            ],
                        },
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "ancestor",
                            foreignField: "_id",
                            as: "ancestor",
                        },
                    },
                    {
                        $unwind: "$ancestor",
                    },
                    {
                        $sort: {
                            path_length: 1,
                        },
                    },
                ])];
            case 1:
                user_ancestors = _g.sent();
                return [4 /*yield*/, (0, trie_1.get_user_data_trie)()];
            case 2:
                user_data_trie = _g.sent();
                if (!(user_ancestors.length && user_ancestors.length > 1 && user_data_trie)) return [3 /*break*/, 16];
                newest_current_user = user_ancestors[0].ancestor;
                trie = user_data_trie.trie;
                users_level_after_modify_1 = {};
                //  Need to slice the first element to remove current user from list of ancestors
                user_ancestors = user_ancestors.slice(1);
                // Insert current level and staking interest rate into user data trie for further query
                trie = (0, trie_1.upsert_new_node)(newest_current_user._id, trie, {
                    // current_level: current_level,
                    interest_rate: newest_current_user.interest_rate,
                    total_deposit_amount: newest_current_user.current_deposit,
                });
                _g.label = 3;
            case 3:
                _g.trys.push([3, 11, 12, 13]);
                _a = __values(user_ancestors.entries()), _b = _a.next();
                _g.label = 4;
            case 4:
                if (!!_b.done) return [3 /*break*/, 10];
                _c = __read(_b.value, 2), index = _c[0], user_ancestor = _c[1];
                ancestor = user_ancestor.ancestor, path_length = user_ancestor.path_length;
                branches = ancestor.branches, accumulative_index = ancestor.accumulative_index, last_accrued_timestamp = ancestor.last_accrued_timestamp, total_global_reward = ancestor.total_global_reward, global_interest_rate = ancestor.global_interest_rate;
                F1_branch_address = path_length > 1 ? user_ancestors[index - 1].ancestor._id : user._id;
                current_branch_staking = branches[F1_branch_address] || "0";
                branches[F1_branch_address] = new bignumber_js_1.BigNumber(current_branch_staking)
                    .plus(new bignumber_js_1.BigNumber(amount).div(1e18))
                    .toString();
                _d = (0, calculate_total_global_rewards_1.calculate_total_global_rewards)(accumulative_index, total_global_reward, global_interest_rate, last_accrued_timestamp, timestamp), updated_total_global_reward = _d.total_global_reward, updated_last_accrued_timestamp = _d.last_accrued_timestamp;
                return [4 /*yield*/, (0, trie_1.get_user_current_level)(user_data_trie, branches)];
            case 5:
                current_level = _g.sent();
                updated_accumulative_index = void 0;
                if (!(ancestor.level === constants_1.UserLevel.UNKNOWN &&
                    current_level != constants_1.UserLevel.UNKNOWN)) return [3 /*break*/, 7];
                return [4 /*yield*/, tree_path_1.UserTreePath.aggregate([
                        {
                            $match: {
                                $and: [
                                    {
                                        ancestor: ancestor._id,
                                    },
                                    {
                                        $and: [
                                            {
                                                path_length: {
                                                    $gt: 0,
                                                },
                                            },
                                        ],
                                    },
                                ],
                            },
                        },
                        {
                            $lookup: {
                                from: "users",
                                localField: "descendant",
                                foreignField: "_id",
                                as: "descendant",
                            },
                        },
                        {
                            $unwind: "$descendant",
                        },
                    ])];
            case 6:
                ancestor_descendants = _g.sent();
                temp_accumulative_index = new bignumber_js_1.BigNumber(0);
                try {
                    for (ancestor_descendants_1 = (e_3 = void 0, __values(ancestor_descendants)), ancestor_descendants_1_1 = ancestor_descendants_1.next(); !ancestor_descendants_1_1.done; ancestor_descendants_1_1 = ancestor_descendants_1.next()) {
                        ancestor_descendant = ancestor_descendants_1_1.value;
                        descendant = ancestor_descendant.descendant;
                        temp_accumulative_index = temp_accumulative_index.plus(new bignumber_js_1.BigNumber(descendant.current_deposit)
                            .multipliedBy(descendant.interest_rate)
                            .div(user_1.BASIS_POINT));
                    }
                }
                catch (e_3_1) { e_3 = { error: e_3_1 }; }
                finally {
                    try {
                        if (ancestor_descendants_1_1 && !ancestor_descendants_1_1.done && (_f = ancestor_descendants_1.return)) _f.call(ancestor_descendants_1);
                    }
                    finally { if (e_3) throw e_3.error; }
                }
                updated_accumulative_index = temp_accumulative_index;
                return [3 /*break*/, 8];
            case 7:
                accumulative_index_diff = new bignumber_js_1.BigNumber(newest_current_user.current_deposit)
                    .multipliedBy(newest_current_user.interest_rate)
                    .div(user_1.BASIS_POINT)
                    .minus(new bignumber_js_1.BigNumber(user.current_deposit)
                    .multipliedBy(new bignumber_js_1.BigNumber(user.interest_rate))
                    .div(user_1.BASIS_POINT));
                updated_accumulative_index = new bignumber_js_1.BigNumber(accumulative_index).plus(accumulative_index_diff);
                updated_accumulative_index = updated_accumulative_index.gt(0)
                    ? updated_accumulative_index
                    : new bignumber_js_1.BigNumber(0);
                _g.label = 8;
            case 8:
                user_global_referral_interest_rate = user_1.UserLevelGlobalInterest[current_level];
                // Insert current level and staking interest rate into user data trie for further query
                trie = (0, trie_1.upsert_new_node)(ancestor._id, trie, {
                    current_level: current_level,
                    // interest_rate: ancestor.interest_rate,
                    // total_deposit_amount: ancestor,
                });
                users_level_after_modify_1[ancestor._id] = {
                    global_interest_rate: user_global_referral_interest_rate,
                    current_level: current_level,
                    branches: branches,
                    last_accrued_timestamp: updated_last_accrued_timestamp,
                    total_global_reward: updated_total_global_reward,
                    accumulative_index: updated_accumulative_index.toFixed(),
                };
                _g.label = 9;
            case 9:
                _b = _a.next();
                return [3 /*break*/, 4];
            case 10: return [3 /*break*/, 13];
            case 11:
                e_2_1 = _g.sent();
                e_2 = { error: e_2_1 };
                return [3 /*break*/, 13];
            case 12:
                try {
                    if (_b && !_b.done && (_e = _a.return)) _e.call(_a);
                }
                finally { if (e_2) throw e_2.error; }
                return [7 /*endfinally*/];
            case 13: return [4 /*yield*/, user_model_1.User.bulkWrite(Object.keys(users_level_after_modify_1).map(function (ancestor_address) {
                    var _a = users_level_after_modify_1[ancestor_address], current_level = _a.current_level, total_global_reward = _a.total_global_reward, global_interest_rate = _a.global_interest_rate, branches = _a.branches, accumulative_index = _a.accumulative_index, last_accrued_timestamp = _a.last_accrued_timestamp;
                    return {
                        updateOne: {
                            filter: { _id: ancestor_address },
                            update: {
                                level: current_level,
                                branches: branches,
                                global_interest_rate: global_interest_rate,
                                total_global_reward: total_global_reward,
                                accumulative_index: accumulative_index,
                                last_accrued_timestamp: last_accrued_timestamp,
                            },
                            upsert: true,
                        },
                    };
                }))];
            case 14:
                _g.sent();
                return [4 /*yield*/, trie_3.UserDataTrie.findByIdAndUpdate(user_data_trie ? user_data_trie._id : undefined, {
                        $set: {
                            trie: trie,
                        },
                    }, {
                        upsert: true,
                    })];
            case 15:
                _g.sent();
                _g.label = 16;
            case 16: return [2 /*return*/];
        }
    });
}); };
exports.update_user_branches = update_user_branches;
