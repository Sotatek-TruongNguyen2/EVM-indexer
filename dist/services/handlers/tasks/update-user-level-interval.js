"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.update_user_level_interval = void 0;
var user_model_1 = require("../models/user.model");
var update_user_level_interval = function (logger) {
    var cron = require("node-cron");
    cron.schedule("*/5 * * * *", function () {
        logger.info("Running task ".concat(exports.update_user_level_interval.name, " every 5 minutes!"));
        var cursor = user_model_1.User.find({});
    });
};
exports.update_user_level_interval = update_user_level_interval;
