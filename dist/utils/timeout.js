"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wait = exports.timeout = void 0;
var timeout = function (prom, time) {
    var timeoutError = new Error("execution time has exceeded the allowed time frame of ".concat(time, " ms"));
    var timer; // will receive the setTimeout defined from time
    timeoutError.name = "TimeoutErr::Elapsed";
    return Promise.race([
        prom,
        new Promise(function (_r, rej) { return (timer = setTimeout(rej, time, timeoutError)); }), // returns the defined timeoutError in case of rejection
    ])
        .catch(function (err) {
        // handle errors that may occur during the promise race
        throw err;
    })
        .finally(function () { return clearTimeout(timer); }); // clears timer
};
exports.timeout = timeout;
var wait = function (duration) {
    return new Promise(function (res, rej) {
        setTimeout(function () {
            res(true);
        }, duration);
    });
};
exports.wait = wait;
