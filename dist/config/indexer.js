"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndexerConfig = exports.STARTING_PREVIOUS_TRIGGERS_PER_BLOCK = void 0;
// A high number here forces a slow start.
exports.STARTING_PREVIOUS_TRIGGERS_PER_BLOCK = 1000000;
var IndexerConfig = /** @class */ (function () {
    function IndexerConfig() {
    }
    IndexerConfig.getInstance = function () {
        if (!IndexerConfig.instance) {
            IndexerConfig.instance = {
                MAXIMUM_RPC_REQUEST_FAILED_TOLERANT_TIMES: Number(process.env.MAXIMUM_RPC_TOLERANT_TIMES || 5),
                ETH_GET_LOGS_MAX_CONTRACTS: Number(process.env.ETH_GET_LOGS_MAX_CONTRACTS || 2000),
                GRAPH_GETH_ETH_CALL_ERRORS: [],
                ETHEREUM_JSON_RPC_TIMEOUT: Number(process.env.ETHEREUM_JSON_RPC_TIMEOUT || 180000),
                INGESTOR_POLLING_INTERVAL: Number(process.env.INGESTOR_POLLING_INTERVAL || 2000),
                REQUEST_RETRIES: Number(process.env.REQUEST_RETRIES || 10),
                ETHEREUM_MAX_BLOCK_RANGE_SIZE: Number(process.env.ETHEREUM_MAX_BLOCK_RANGE_SIZE || 2000),
                TARGET_TRIGGERS_PER_BLOCK_RANGE: Number(process.env.TARGET_TRIGGERS_PER_BLOCK_RANGE || 100),
                ETHEREUM_MAX_EVENT_ONLY_RANGE: Number(process.env.ETHEREUM_MAX_EVENT_ONLY_RANGE || 500),
                GRAPH_START_BLOCK: process.env.GRAPH_START_BLOCK || null,
                // REORG_THRESHOLD: Number(process.env.REORG_THRESHOLD || 250),
                REORG_THRESHOLD: Number(process.env.REORG_THRESHOLD || 50),
                ETHEREUM_BLOCK_BATCH_SIZE: Number(process.env.ETHEREUM_BLOCK_BATCH_SIZE || 10),
                NEW_BLOCK_POLLING_INTERVAL: Number(process.env.NEW_BLOCK_POLLING_INTERVAL || 5000),
                CHAIN_STORE_RECENT_BLOCKS_CACHE_CAPACITY: Number(process.env.CHAIN_STORE_RECENT_BLOCKS_CACHE_CAPACITY || 10),
            };
        }
        return IndexerConfig.instance;
    };
    return IndexerConfig;
}());
exports.IndexerConfig = IndexerConfig;
