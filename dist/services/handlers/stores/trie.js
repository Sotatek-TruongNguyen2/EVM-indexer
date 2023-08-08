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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.get_user_current_level = exports.get_level_by_user_addresses = exports.upsert_user_data = exports.get_user_data_trie = exports.get_user_level_by_address = exports.upsert_new_node = void 0;
var bignumber_js_1 = __importDefault(require("bignumber.js"));
var constants_1 = require("../constants");
var trie_1 = require("../models/trie");
var env_1 = require("../../../config/env");
var upsert_new_node = function (str, node, data) {
    if (str.length === 0) {
        node.data = Object.assign(node.data || {}, data);
        node.end = true;
        return node;
    }
    if (!node.keys[str[0]]) {
        node.keys[str[0]] = { keys: {} };
        node.keys[str[0]] = (0, exports.upsert_new_node)(str.substring(1), node.keys[str[0]], data);
    }
    else {
        node.keys[str[0]] = (0, exports.upsert_new_node)(str.substring(1), node.keys[str[0]], data);
    }
    return node;
};
exports.upsert_new_node = upsert_new_node;
var get_user_level_by_address = function (addr, node) {
    var e_1, _a;
    if (!node) {
        return constants_1.UserLevel.UNKNOWN;
    }
    var available = true;
    var immediate_node;
    try {
        for (var addr_1 = __values(addr), addr_1_1 = addr_1.next(); !addr_1_1.done; addr_1_1 = addr_1.next()) {
            var c = addr_1_1.value;
            if (!node.keys[c]) {
                return constants_1.UserLevel.UNKNOWN;
            }
            immediate_node = node.keys[c];
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (addr_1_1 && !addr_1_1.done && (_a = addr_1.return)) _a.call(addr_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    if (available && immediate_node && immediate_node.end) {
        return immediate_node.data.level;
    }
    return constants_1.UserLevel.UNKNOWN;
};
exports.get_user_level_by_address = get_user_level_by_address;
var get_user_data_trie = function () { return __awaiter(void 0, void 0, void 0, function () {
    var user_data_trie;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, trie_1.UserDataTrie.find({})];
            case 1:
                user_data_trie = _a.sent();
                return [2 /*return*/, user_data_trie ? user_data_trie[0] : undefined];
        }
    });
}); };
exports.get_user_data_trie = get_user_data_trie;
var upsert_user_data = function (user_addr, data) { return __awaiter(void 0, void 0, void 0, function () {
    var user_data_trie, address_without_0x, default_root_trie, trie;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, exports.get_user_data_trie)()];
            case 1:
                user_data_trie = _a.sent();
                address_without_0x = user_addr.substring(2);
                default_root_trie = { keys: {}, data: {}, end: false };
                trie = user_data_trie ? user_data_trie.trie : default_root_trie;
                trie = (0, exports.upsert_new_node)(address_without_0x, trie, data);
                return [4 /*yield*/, trie_1.UserDataTrie.findByIdAndUpdate(user_data_trie ? user_data_trie._id : 1, {
                        $set: {
                            trie: trie,
                        },
                    }, {
                        upsert: true,
                    })];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.upsert_user_data = upsert_user_data;
var get_level_by_user_addresses = function (user_data_trie, user_addresses) { return __awaiter(void 0, void 0, void 0, function () {
    var levels, user_addresses_1, user_addresses_1_1, addr;
    var e_2, _a;
    return __generator(this, function (_b) {
        levels = [];
        if (!user_data_trie) {
            return [2 /*return*/, levels];
        }
        try {
            for (user_addresses_1 = __values(user_addresses), user_addresses_1_1 = user_addresses_1.next(); !user_addresses_1_1.done; user_addresses_1_1 = user_addresses_1.next()) {
                addr = user_addresses_1_1.value;
                levels.push((0, exports.get_user_level_by_address)(addr, user_data_trie.trie));
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (user_addresses_1_1 && !user_addresses_1_1.done && (_a = user_addresses_1.return)) _a.call(user_addresses_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return [2 /*return*/, levels];
    });
}); };
exports.get_level_by_user_addresses = get_level_by_user_addresses;
var get_user_current_level = function (user_data_trie, branches) { return __awaiter(void 0, void 0, void 0, function () {
    var environment_config, branch_types, unknown_branches_staking, F1_addresses, F1_levels, _a, _b, _c, index, F1_address;
    var e_3, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                environment_config = env_1.EnvironmentConfig.getInstance();
                branch_types = {};
                unknown_branches_staking = "0";
                F1_addresses = Object.keys(branches);
                return [4 /*yield*/, (0, exports.get_level_by_user_addresses)(user_data_trie, F1_addresses)];
            case 1:
                F1_levels = _e.sent();
                if (F1_addresses.length > 0 && F1_addresses.length === F1_levels.length) {
                    try {
                        for (_a = __values(F1_addresses.entries()), _b = _a.next(); !_b.done; _b = _a.next()) {
                            _c = __read(_b.value, 2), index = _c[0], F1_address = _c[1];
                            branch_types[F1_address] += (branch_types[F1_address] || 0) + 1;
                            if (F1_levels[index] === constants_1.UserLevel.UNKNOWN) {
                                unknown_branches_staking = new bignumber_js_1.default(unknown_branches_staking)
                                    .plus(new bignumber_js_1.default(branches[F1_address]).gt(environment_config.MAXIMUM_BRANCH_STAKING)
                                    ? new bignumber_js_1.default(environment_config.MAXIMUM_BRANCH_STAKING)
                                    : new bignumber_js_1.default(branches[F1_address]))
                                    .toString();
                            }
                        }
                    }
                    catch (e_3_1) { e_3 = { error: e_3_1 }; }
                    finally {
                        try {
                            if (_b && !_b.done && (_d = _a.return)) _d.call(_a);
                        }
                        finally { if (e_3) throw e_3.error; }
                    }
                    if (branch_types[constants_1.UserLevel.BLACK_DIAMOND] >= 3) {
                        return [2 /*return*/, constants_1.UserLevel.CROWN_DIAMOND];
                    }
                    if (branch_types[constants_1.UserLevel.BLUE_DIAMOND] >= 3) {
                        return [2 /*return*/, constants_1.UserLevel.BLACK_DIAMOND];
                    }
                    if (branch_types[constants_1.UserLevel.DIAMOND] >= 3) {
                        return [2 /*return*/, constants_1.UserLevel.BLUE_DIAMOND];
                    }
                    if (branch_types[constants_1.UserLevel.EMERALD] >= 2 &&
                        branch_types[constants_1.UserLevel.RUBY] >= 1) {
                        return [2 /*return*/, constants_1.UserLevel.DIAMOND];
                    }
                    if (branch_types[constants_1.UserLevel.RUBY] >= 2 &&
                        branch_types[constants_1.UserLevel.SAPPHIRE] >= 1) {
                        return [2 /*return*/, constants_1.UserLevel.EMERALD];
                    }
                    if (branch_types[constants_1.UserLevel.SAPPHIRE] >= 2) {
                        return [2 /*return*/, constants_1.UserLevel.RUBY];
                    }
                    // console.log(
                    //   "zxczxcx: ",
                    //   unknown_branches_staking,
                    //   environment_config.SHAPPIRE_LEVEL_STAKING_CONDITION,
                    // );
                    if (new bignumber_js_1.default(unknown_branches_staking).gte(new bignumber_js_1.default(environment_config.SHAPPIRE_LEVEL_STAKING_CONDITION))) {
                        return [2 /*return*/, constants_1.UserLevel.SAPPHIRE];
                    }
                }
                return [2 /*return*/, constants_1.UserLevel.UNKNOWN];
        }
    });
}); };
exports.get_user_current_level = get_user_current_level;
