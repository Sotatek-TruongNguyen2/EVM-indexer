"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EthGetLogsFilter = void 0;
var EthGetLogsFilter = /** @class */ (function () {
    function EthGetLogsFilter(_contracts, _event_signatures) {
        this._contracts = _contracts;
        this._event_signatures = _event_signatures;
    }
    EthGetLogsFilter.from_contract = function (address) {
        return new EthGetLogsFilter([address], []);
    };
    EthGetLogsFilter.from_event = function (event_signatures) {
        return new EthGetLogsFilter([], [event_signatures]);
    };
    Object.defineProperty(EthGetLogsFilter.prototype, "contracts", {
        get: function () {
            return this._contracts;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(EthGetLogsFilter.prototype, "event_signatures", {
        get: function () {
            return this._event_signatures;
        },
        enumerable: false,
        configurable: true
    });
    return EthGetLogsFilter;
}());
exports.EthGetLogsFilter = EthGetLogsFilter;
