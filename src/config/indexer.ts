interface IndexerConfigType {
  /// `GRAPH_STORE_RECENT_BLOCKS_CACHE_CAPACITY`. The default value is 10 blocks.
  CHAIN_STORE_RECENT_BLOCKS_CACHE_CAPACITY: number;
  NEW_BLOCK_POLLING_INTERVAL: number;
  REORG_THRESHOLD: number;
  // block hash:block number where the forked subgraph will start indexing at.
  GRAPH_START_BLOCK: string | null;
  /// Set by the environment variable `GRAPH_ETH_GET_LOGS_MAX_CONTRACTS`. The
  /// default value is 2000.
  ETH_GET_LOGS_MAX_CONTRACTS: number;
  /// Additional deterministic errors that have not yet been hardcoded.
  ///
  /// Set by the environment variable `GRAPH_GETH_ETH_CALL_ERRORS`, separated
  /// by `;`.
  GRAPH_GETH_ETH_CALL_ERRORS: String[];
  /// Maximum number of blocks to request in each chunk.
  ///
  /// Set by the environment variable `GRAPH_ETHEREUM_MAX_BLOCK_RANGE_SIZE`.
  /// The default value is 2000 blocks.
  ETHEREUM_MAX_BLOCK_RANGE_SIZE: number;
  /// This should not be too large that it causes requests to timeout without
  /// us catching it, nor too small that it causes us to timeout requests that
  /// would've succeeded. We've seen successful `eth_getLogs` requests take
  /// over 120 seconds.
  ///
  /// Set by the environment variable `GRAPH_ETHEREUM_JSON_RPC_TIMEOUT`
  /// (expressed in seconds). The default value is 180s.
  ETHEREUM_JSON_RPC_TIMEOUT: number;
  /// This is used for requests that will not fail the subgraph if the limit
  /// is reached, but will simply restart the syncing step, so it can be low.
  /// This limit guards against scenarios such as requesting a block hash that
  /// has been reorged.
  ///
  /// Set by the environment variable `GRAPH_ETHEREUM_REQUEST_RETRIES`. The
  /// default value is 10.
  REQUEST_RETRIES: number;
  /// Ideal number of triggers in a range. The range size will adapt to try to
  /// meet this.
  ///
  /// Set by the environment variable
  /// `GRAPH_ETHEREUM_TARGET_TRIGGERS_PER_BLOCK_RANGE`. The default value is
  /// 100.
  TARGET_TRIGGERS_PER_BLOCK_RANGE: number;
  /// The time to wait between polls when using polling block ingestor.
  /// The value is set in millis and the default is 1000.
  INGESTOR_POLLING_INTERVAL: number;
  /// Maximum range size for `eth.getLogs` requests that don't filter on
  /// contract address, only event signature, and are therefore expensive.
  ///
  /// Set by the environment variable `ETHEREUM_MAX_EVENT_ONLY_RANGE`. The
  /// default value is 500 blocks, which is reasonable according to Ethereum
  /// node operators.
  ETHEREUM_MAX_EVENT_ONLY_RANGE: number;
  ETHEREUM_BLOCK_BATCH_SIZE: number;
}
// A high number here forces a slow start.
export const STARTING_PREVIOUS_TRIGGERS_PER_BLOCK = 1_000_000;

export class IndexerConfig {
  private static instance: IndexerConfigType;
  public static getInstance(): IndexerConfigType {
    if (!IndexerConfig.instance) {
      IndexerConfig.instance = {
        ETH_GET_LOGS_MAX_CONTRACTS: Number(
          process.env.ETH_GET_LOGS_MAX_CONTRACTS || 2000,
        ),
        GRAPH_GETH_ETH_CALL_ERRORS: [],
        ETHEREUM_JSON_RPC_TIMEOUT: Number(
          process.env.ETHEREUM_JSON_RPC_TIMEOUT || 180000,
        ),
        INGESTOR_POLLING_INTERVAL: Number(
          process.env.INGESTOR_POLLING_INTERVAL || 3000,
        ),
        REQUEST_RETRIES: Number(process.env.REQUEST_RETRIES || 10),
        ETHEREUM_MAX_BLOCK_RANGE_SIZE: Number(
          process.env.ETHEREUM_MAX_BLOCK_RANGE_SIZE || 2000,
        ),
        TARGET_TRIGGERS_PER_BLOCK_RANGE: Number(
          process.env.TARGET_TRIGGERS_PER_BLOCK_RANGE || 100,
        ),
        ETHEREUM_MAX_EVENT_ONLY_RANGE: Number(
          process.env.ETHEREUM_MAX_EVENT_ONLY_RANGE || 500,
        ),
        GRAPH_START_BLOCK: process.env.GRAPH_START_BLOCK || null,
        REORG_THRESHOLD: Number(process.env.REORG_THRESHOLD || 250),
        ETHEREUM_BLOCK_BATCH_SIZE: Number(
          process.env.ETHEREUM_BLOCK_BATCH_SIZE || 10,
        ),
        NEW_BLOCK_POLLING_INTERVAL: Number(
          process.env.NEW_BLOCK_POLLING_INTERVAL || 5000,
        ),
        CHAIN_STORE_RECENT_BLOCKS_CACHE_CAPACITY: Number(
          process.env.CHAIN_STORE_RECENT_BLOCKS_CACHE_CAPACITY || 10,
        ),
      };
    }

    return IndexerConfig.instance;
  }
}
