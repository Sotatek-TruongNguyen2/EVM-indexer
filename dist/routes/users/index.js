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
exports.user_routes = void 0;
var express_1 = __importDefault(require("express"));
var user_model_1 = require("../../services/handlers/models/user.model");
var redis_1 = require("../../caching/redis");
var constants_1 = require("../../services/handlers/constants");
var routes = express_1.default.Router();
exports.user_routes = routes;
var USER_LEVEL_PREFIX = "USER_LEVEL";
routes.route("/level/:address").get(function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var address, redis_client, current_level_cached, user, user_current_level;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    address = req.params.address;
                    redis_client = redis_1.RedisConnection.getClient();
                    return [4 /*yield*/, redis_client.get("".concat(USER_LEVEL_PREFIX, "_").concat(address))];
                case 1:
                    current_level_cached = _a.sent();
                    if (current_level_cached) {
                        res.status(200).send({
                            level: current_level_cached,
                            address: address,
                        });
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, user_model_1.User.findOne({
                            address: {
                                $eq: address,
                            },
                        })];
                case 2:
                    user = _a.sent();
                    user_current_level = constants_1.UserLevel.UNKNOWN;
                    if (!user) return [3 /*break*/, 4];
                    user_current_level = user.level;
                    // will cached the current user level in 5 minutes
                    return [4 /*yield*/, redis_client.setex("".concat(USER_LEVEL_PREFIX, "_").concat(address), 300, user_current_level)];
                case 3:
                    // will cached the current user level in 5 minutes
                    _a.sent();
                    _a.label = 4;
                case 4:
                    res.status(200).send({
                        level: user_current_level,
                        // branches: user ? Object.fromEntries(user.branches) : {},
                        // referralBy: user?.referralBy || ethers.constants.AddressZero,
                        // current_deposit: user?..current_deposit || "0",
                        address: address,
                    });
                    return [2 /*return*/];
            }
        });
    });
});
