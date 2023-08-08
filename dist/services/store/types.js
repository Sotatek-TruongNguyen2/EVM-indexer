"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogCode = void 0;
var LogCode;
(function (LogCode) {
    LogCode[LogCode["SubgraphStartFailure"] = 0] = "SubgraphStartFailure";
    LogCode[LogCode["SubgraphSyncingFailure"] = 1] = "SubgraphSyncingFailure";
    LogCode[LogCode["SubgraphSyncingFailureNotRecorded"] = 2] = "SubgraphSyncingFailureNotRecorded";
    LogCode[LogCode["BlockIngestionStatus"] = 3] = "BlockIngestionStatus";
    LogCode[LogCode["BlockIngestionLagging"] = 4] = "BlockIngestionLagging";
    LogCode[LogCode["GraphQlQuerySuccess"] = 5] = "GraphQlQuerySuccess";
    LogCode[LogCode["GraphQlQueryFailure"] = 6] = "GraphQlQueryFailure";
    LogCode[LogCode["TokioContention"] = 7] = "TokioContention";
})(LogCode || (LogCode = {}));
exports.LogCode = LogCode;
