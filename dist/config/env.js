"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvironmentConfig = void 0;
var EnvironmentConfig = /** @class */ (function () {
    function EnvironmentConfig() {
    }
    EnvironmentConfig.getInstance = function () {
        if (!EnvironmentConfig.instance) {
            EnvironmentConfig.instance = {
                MAXIMUM_BRANCH_STAKING: Number(process.env.MAXIMUM_BRANCH_STAKING || 600000),
                SHAPPIRE_LEVEL_STAKING_CONDITION: Number(process.env.SHAPPIRE_LEVEL_STAKING_CONDITION || 1500000),
            };
        }
        return EnvironmentConfig.instance;
    };
    return EnvironmentConfig;
}());
exports.EnvironmentConfig = EnvironmentConfig;
