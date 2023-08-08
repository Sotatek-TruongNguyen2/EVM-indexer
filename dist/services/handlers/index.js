"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHandlerByName = exports.handlers = void 0;
var user_deposit_handler_1 = require("./user-deposit-handler");
var user_withdraw_handler_1 = require("./user-withdraw-handler");
exports.handlers = {
    user_deposit_handler: user_deposit_handler_1.user_deposit_handler,
    user_withdraw_handler: user_withdraw_handler_1.user_withdraw_handler,
};
var getHandlerByName = function (name) {
    return exports.handlers[name];
};
exports.getHandlerByName = getHandlerByName;
