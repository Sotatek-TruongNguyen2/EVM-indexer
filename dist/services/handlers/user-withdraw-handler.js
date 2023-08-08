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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.user_withdraw_handler = void 0;
var ethers_1 = require("ethers");
var transaction_history_1 = require("./stores/transaction_history");
var NikaStaking_json_1 = __importDefault(require("../../blockchain/abi/NikaStaking.json"));
var transaction_category_1 = require("./constants/transaction-category");
var update_user_info_1 = require("./stores/update_user_info");
var user_withdraw_handler = function (logger, log_params) { return __awaiter(void 0, void 0, void 0, function () {
    var abi, log, sender, user, withdraw_amount, current_user, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                abi = new ethers_1.ethers.utils.Interface(NikaStaking_json_1.default);
                log = abi.parseLog(log_params.raw_log);
                sender = ethers_1.ethers.utils.getAddress(log_params.raw_log.sender);
                user = ethers_1.ethers.utils.getAddress(log.args["user"]);
                withdraw_amount = log.args["amount"].toString();
                _a.label = 1;
            case 1:
                _a.trys.push([1, 5, , 6]);
                return [4 /*yield*/, (0, transaction_history_1.save_tx)({
                        referrer: ethers_1.ethers.constants.AddressZero,
                        sender: sender,
                        user: user,
                        amount: withdraw_amount,
                        block_number: log_params.metadata.block_number,
                        category: transaction_category_1.TransactionCategory.WITHDRAW,
                        timestamp: log_params.metadata.timestamp,
                        tx_hash: log_params.raw_log.transactionHash,
                    })];
            case 2:
                _a.sent();
                return [4 /*yield*/, (0, update_user_info_1.update_user_info)(user, withdraw_amount, ethers_1.ethers.constants.AddressZero, true, true)];
            case 3:
                current_user = _a.sent();
                return [4 /*yield*/, (0, update_user_info_1.update_user_branches)(current_user, withdraw_amount, log_params.metadata.timestamp)];
            case 4:
                _a.sent();
                return [3 /*break*/, 6];
            case 5:
                err_1 = _a.sent();
                // logger.warn(`Error when do call the handler err.message`);
                throw err_1;
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.user_withdraw_handler = user_withdraw_handler;
