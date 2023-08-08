"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BASIS_POINT = exports.ACCUMULATIVE_PRECISION = exports.UserLevelGlobalInterest = exports.UserStakingInterest = exports.UserLevel = void 0;
var UserLevel;
(function (UserLevel) {
    UserLevel["UNKNOWN"] = "UNKNOWN";
    UserLevel["SAPPHIRE"] = "SAPPHIRE";
    UserLevel["RUBY"] = "RUBY";
    UserLevel["EMERALD"] = "EMERALD";
    UserLevel["DIAMOND"] = "DIAMOND";
    UserLevel["BLUE_DIAMOND"] = "BLUE_DIAMOND";
    UserLevel["BLACK_DIAMOND"] = "BLACK_DIAMOND";
    UserLevel["CROWN_DIAMOND"] = "CROWN_DIAMOND";
})(UserLevel || (UserLevel = {}));
exports.UserLevel = UserLevel;
var UserLevelGlobalInterest = {
    UNKNOWN: 0,
    SAPPHIRE: 100,
    RUBY: 200,
    EMERALD: 300,
    DIAMOND: 400,
    BLUE_DIAMOND: 600,
    BLACK_DIAMOND: 800,
    CROWN_DIAMOND: 1000,
};
exports.UserLevelGlobalInterest = UserLevelGlobalInterest;
var UserStakingInterest = {
    "100-16100": 600,
    "16100-61000": 700,
    "60100-160000": 800,
    "160000-310000": 1000,
    "310000-": 1200,
};
exports.UserStakingInterest = UserStakingInterest;
var ACCUMULATIVE_PRECISION = 1e18;
exports.ACCUMULATIVE_PRECISION = ACCUMULATIVE_PRECISION;
var BASIS_POINT = 10000;
exports.BASIS_POINT = BASIS_POINT;
