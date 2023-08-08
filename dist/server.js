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
var dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
var express_1 = __importDefault(require("express"));
var mongoose_1 = __importDefault(require("mongoose"));
var body_parser_1 = __importDefault(require("body-parser"));
var morgan_1 = __importDefault(require("morgan"));
var routes_1 = __importDefault(require("./routes"));
var redis_1 = require("./caching/redis");
var blockchain_indexer_1 = require("./blockchain-indexer");
var main = function () { return __awaiter(void 0, void 0, void 0, function () {
    var redis_client, err_1, blockchain_indexer, app, PORT;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, redis_1.RedisConnection.getClient({
                    password: process.env.REDIS_PASSWORD,
                })];
            case 1:
                redis_client = _a.sent();
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, , 5]);
                return [4 /*yield*/, redis_client.ping(function () {
                        console.log("Connected to Redis!");
                    })];
            case 3:
                _a.sent();
                return [3 /*break*/, 5];
            case 4:
                err_1 = _a.sent();
                throw new Error(err_1.message);
            case 5:
                if (!process.env.MONGODB_CONNECTION_STRING) return [3 /*break*/, 7];
                return [4 /*yield*/, mongoose_1.default.connect(process.env.MONGODB_CONNECTION_STRING)];
            case 6:
                _a.sent();
                console.log("Connected to MongoDB!");
                _a.label = 7;
            case 7:
                blockchain_indexer = new blockchain_indexer_1.BlockchainIndexer();
                blockchain_indexer.start();
                app = (0, express_1.default)();
                app.use(body_parser_1.default.urlencoded({ extended: true }));
                app.use(body_parser_1.default.json());
                app.use((0, morgan_1.default)("dev"));
                app.use("/", routes_1.default);
                PORT = process.env.SERVER_PORT || 2009;
                app.listen(PORT, function () {
                    console.log("EVM tx indexer listening on port ".concat(PORT));
                });
                return [2 /*return*/];
        }
    });
}); };
main();
