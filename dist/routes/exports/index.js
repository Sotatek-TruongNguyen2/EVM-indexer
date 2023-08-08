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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.export_routes = void 0;
var express_1 = __importDefault(require("express"));
var google_auth_library_1 = require("google-auth-library");
var googleapis_1 = require("googleapis");
var excel4node_1 = __importDefault(require("excel4node"));
var fs_1 = __importDefault(require("fs"));
var user_model_1 = require("../../services/handlers/models/user.model");
var constants_1 = require("../../services/handlers/constants");
var calculate_total_global_rewards_1 = require("../../helpers/calculate_total_global_rewards");
var bignumber_js_1 = require("bignumber.js");
var routes = express_1.default.Router();
exports.export_routes = routes;
routes.route("/users").post(function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var users, wb, ws, row_number, users_1, users_1_1, user, updated_total_global_reward;
        var e_1, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, user_model_1.User.find({
                        level: {
                            $ne: constants_1.UserLevel.UNKNOWN,
                        },
                    })];
                case 1:
                    users = _b.sent();
                    wb = new excel4node_1.default.Workbook();
                    ws = wb.addWorksheet("NIKA_STAKING_USER_INTEREST_".concat(Math.floor(Date.now() / 1000)));
                    ws.cell(1, 1).string("Address");
                    ws.cell(1, 2).string("Level");
                    ws.cell(1, 3).string("Staking Interest Rate");
                    ws.cell(1, 4).string("Global Interest Rate");
                    ws.cell(1, 5).string("Global Reward");
                    ws.cell(1, 6).string("Last Accumulated Timestamp");
                    row_number = 2;
                    try {
                        for (users_1 = __values(users), users_1_1 = users_1.next(); !users_1_1.done; users_1_1 = users_1.next()) {
                            user = users_1_1.value;
                            updated_total_global_reward = (0, calculate_total_global_rewards_1.calculate_total_global_rewards)(user.accumulative_index, user.total_global_reward, user.global_interest_rate, user.last_accrued_timestamp, Math.floor(new Date().getTime() / 1000)).total_global_reward;
                            ws.cell(row_number, 1).string(user._id);
                            ws.cell(row_number, 2).string(user.level);
                            ws.cell(row_number, 3).string("".concat(new bignumber_js_1.BigNumber(user.interest_rate)
                                .div(10000)
                                .multipliedBy(100)
                                .toFixed(), "%"));
                            ws.cell(row_number, 4).string("".concat(new bignumber_js_1.BigNumber(user.global_interest_rate)
                                .div(10000)
                                .multipliedBy(100)
                                .toFixed(), "%"));
                            ws.cell(row_number, 5).string(new bignumber_js_1.BigNumber(updated_total_global_reward).toString());
                            ws.cell(row_number, 5).string(new bignumber_js_1.BigNumber(updated_total_global_reward).toString());
                            new Date(user.last_accrued_timestamp).getTime() > 0
                                ? ws
                                    .cell(row_number, 6)
                                    .date(new Date(user.last_accrued_timestamp * 1000))
                                : ws.number(row_number, 6).number(0);
                            row_number++;
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (users_1_1 && !users_1_1.done && (_a = users_1.return)) _a.call(users_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                    // await User.bulkWrite(
                    //   Object.keys(updated_global_reward).map((user_address) => {
                    //     const { total_global_reward, last_accrued_index } =
                    //       updated_global_reward[user_address];
                    //     return {
                    //       updateOne: {
                    //         filter: { _id: user_address },
                    //         update: {
                    //           total_global_reward,
                    //           last_accrued_index,
                    //         },
                    //         upsert: true,
                    //       },
                    //     };
                    //   }),
                    // );
                    // console.log(
                    //   "wb: ",
                    //   path.resolve("../../reports/Nika_Staking_User_Stats.xlsx"),
                    //   process.cwd(),
                    // );
                    wb.write("".concat(process.cwd(), "/src/reports/Nika_Staking_User_Stats.xlsx"), function (err, stats) {
                        return __awaiter(this, void 0, void 0, function () {
                            var auth, service, requestBody, media, file, err_1;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (!err) return [3 /*break*/, 1];
                                        console.error(err);
                                        return [3 /*break*/, 5];
                                    case 1:
                                        console.log(stats); // Prints out an instance of a node.js fs.Stats object
                                        auth = new google_auth_library_1.GoogleAuth({
                                            keyFile: "".concat(process.cwd(), "/src/google-api-keys/nika-393107-93a6e2f75cf5.json"),
                                            scopes: "https://www.googleapis.com/auth/drive",
                                        });
                                        service = googleapis_1.google.drive({ version: "v3", auth: auth });
                                        requestBody = {
                                            name: "Nika_Staking_User_Stats.xlsx",
                                            fields: "id",
                                            parents: ["1VJp2Fvb8xlhKpYawXR3zE2LH4PwyWpyk"],
                                        };
                                        media = {
                                            mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                                            body: fs_1.default.createReadStream("".concat(process.cwd(), "/src/reports/Nika_Staking_User_Stats.xlsx")),
                                        };
                                        _a.label = 2;
                                    case 2:
                                        _a.trys.push([2, 4, , 5]);
                                        return [4 /*yield*/, service.files.create({
                                                requestBody: requestBody,
                                                media: media,
                                            })];
                                    case 3:
                                        file = _a.sent();
                                        res.status(200).send({
                                            created_status: "Successfully",
                                            file_id: file.data.id,
                                        });
                                        return [3 /*break*/, 5];
                                    case 4:
                                        err_1 = _a.sent();
                                        // TODO(developer) - Handle error
                                        throw err_1;
                                    case 5: return [2 /*return*/];
                                }
                            });
                        });
                    });
                    return [2 /*return*/];
            }
        });
    });
});
