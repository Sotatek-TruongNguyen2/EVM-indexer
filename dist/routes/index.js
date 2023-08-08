"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var users_1 = require("./users");
var exports_1 = require("./exports");
var routes = express_1.default.Router();
routes.use("/users", users_1.user_routes);
routes.use("/exports", exports_1.export_routes);
exports.default = routes;
