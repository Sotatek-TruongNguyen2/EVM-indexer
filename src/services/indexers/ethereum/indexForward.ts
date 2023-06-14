import { BigNumber, ethers } from "ethers";
import { Block } from "@ethersproject/abstract-provider";
import { RedisConnection } from "../../../db/redis";
import {
  ChainConfig,
  // buildTokenContract,
  // getMasterChefAbi,
  // getRPCProvider,
} from "../../../config/chainConfig";
// import { getEpochSeconds } from "../utils/epoch";
// import { processEvents } from "./processEvents";
// import { getTopicsHash } from "../config/topic";
import { getIndexerLogger } from "../../../utils/logger";
import { callRPCMethod, callRPCRawMethod } from "../../../utils/rpcRequest";
import {
  IndexerConfig,
  STARTING_PREVIOUS_TRIGGERS_PER_BLOCK,
} from "../../../config/indexer";
import {
  get_deployment_latest_block,
  update_latest_ethereum_block,
} from "../../store/contract_deployment_store";
import { RetryConfig } from "../../retry";
import {
  IContractDeployment,
  ITriggerFilters,
} from "../../../models/contract-deployment.model";
import { Logger } from "winston";
import { wait } from "../../../utils/timeout";
import { ETHAdapter } from "../../adapters/eth/ETHAdapter";

// Codes returned by Ethereum node providers if an eth_getLogs request is too heavy.
// The first one is for Infura when it hits the log limit, the rest for Alchemy timeouts.
const TOO_MANY_LOGS_FINGERPRINTS = [
  "ServerError(-32005)",
  "503 Service Unavailable",
  "ServerError(-32000)",
];

enum NextBlockReturnsState {
  Revert,
  Done,
  NextBlocks,
}

type BlockWithTriggers = {
  block: Block;
  triggers: any[];
};

type NextBlocks = {
  range_size: number;
  blocks_with_triggers: BlockWithTriggers[];
};

type NextBlockReturns = {
  state: NextBlockReturnsState;
  data?: NextBlocks;
};

enum ReconciliationStep {
  ProcessDescendantBlocks,
  Retry,
  /// Subgraph pointer now matches chain head pointer.
  /// Reconciliation is complete.
  Done,
}

enum BlockStreamState {
  /// Starting or restarting reconciliation.
  ///
  /// Valid next states: Reconciliation
  BeginReconciliation,

  /// The BlockStream is reconciling the subgraph store state with the chain store state.
  ///
  /// Valid next states: YieldingBlocks, Idle, BeginReconciliation (in case of revert)
  Reconciliation,

  /// The BlockStream is emitting blocks that must be processed in order to bring the subgraph
  /// store up to date with the chain store.
  ///
  /// Valid next states: BeginReconciliation
  YieldingBlocks,

  /// The BlockStream experienced an error and is pausing before attempting to produce
  /// blocks again.
  ///
  /// Valid next states: BeginReconciliation
  RetryAfterDelay,

  /// The BlockStream has reconciled the subgraph store and chain store states.
  /// No more work is needed until a chain head update.
  ///
  /// Valid next states: BeginReconciliation
  Idle,
}

type IndexingState = {
  state: BlockStreamState;
  next_blocks?: NextBlockReturns;
};

export class EthGetLogsFilter {
  private _contracts: string[];
  private _event_signatures: string[];
  constructor(_contracts: string[], _event_signatures: string[]) {
    this._contracts = _contracts;
    this._event_signatures = _event_signatures;
  }

  static from_contract(address: string) {
    return new EthGetLogsFilter([address], []);
  }

  static from_event(event_signatures: string) {
    return new EthGetLogsFilter([], [event_signatures]);
  }

  public get contracts(): string[] {
    return this._contracts;
  }

  public get event_signatures(): string[] {
    return this._event_signatures;
  }

  // public set event_signatures(signature: string) {
  //   this._event_signatures.push(signature);

  // }
}

export class IndexForward {
  private _previous_triggers_per_block: number;
  private _previous_block_range_size: number;
  private _max_block_range_size: number;
  private _target_triggers_per_block_range: number;
  private _consecutive_err_count: number;
  private _index_state: IndexingState;
  private _deployment_latest_block: number | undefined;

  private _logger: Logger;
  private _deployment: IContractDeployment;
  private _adapter: ETHAdapter;

  constructor(deployment: IContractDeployment) {
    const indexer_config = IndexerConfig.getInstance();

    this._index_state = { state: BlockStreamState.BeginReconciliation };
    this._consecutive_err_count = 0;
    this._target_triggers_per_block_range =
      indexer_config.TARGET_TRIGGERS_PER_BLOCK_RANGE;
    this._previous_triggers_per_block = STARTING_PREVIOUS_TRIGGERS_PER_BLOCK;
    this._previous_block_range_size = 1;
    this._max_block_range_size = indexer_config.ETHEREUM_MAX_BLOCK_RANGE_SIZE;
    this._deployment = deployment;
    this._adapter = new ETHAdapter(deployment.chain_id);

    const chainConfig = ChainConfig[this.deployment.chain_id as number];

    this._logger = getIndexerLogger(
      `${chainConfig.name}_${deployment.deployment}_${IndexForward.name}`,
    );
  }

  public set deployment_latest_block(
    deployment_latest_block: number | undefined,
  ) {
    this._deployment_latest_block = deployment_latest_block;
  }

  public set max_block_range_size(max_block_range_size: number) {
    this._max_block_range_size = max_block_range_size;
  }

  public set previous_triggers_per_block(previous_triggers_per_block: number) {
    this._previous_triggers_per_block = previous_triggers_per_block;
  }

  public set previous_block_range_size(_previous_block_range_size: number) {
    this._previous_block_range_size = _previous_block_range_size;
  }

  public set index_state(index_state: IndexingState) {
    this._index_state = index_state;
  }

  public set consecutive_err_count(consecutive_err_count: number) {
    this._consecutive_err_count = consecutive_err_count;
  }

  public get adapter(): ETHAdapter {
    return this._adapter;
  }

  public get deployment_latest_block(): number | undefined {
    return this._deployment_latest_block;
  }

  public get index_state(): IndexingState {
    return this._index_state;
  }

  public get consecutive_err_count(): number {
    return this._consecutive_err_count;
  }

  public get logger(): Logger {
    return this._logger;
  }

  public get deployment(): IContractDeployment {
    return this._deployment;
  }

  public get target_triggers_per_block_range(): number {
    return this._target_triggers_per_block_range;
  }

  public get previous_triggers_per_block(): number {
    return this._previous_triggers_per_block;
  }

  public get previous_block_range_size(): number {
    return this._previous_block_range_size;
  }
  public get max_block_range_size(): number {
    return this._max_block_range_size;
  }

  private async get_next_step(): Promise<
    { state: ReconciliationStep; data?: any } | undefined
  > {
    const indexer_config = IndexerConfig.getInstance();
    const chainConfig = ChainConfig[this.deployment.chain_id as number];

    if (!chainConfig) {
      return;
    }

    let chainName = chainConfig.name;
    // let redisClient = await RedisConnection.getClient();

    let latestBlock = await callRPCMethod(chainConfig.id, "getBlock", [
      "latest",
    ]);
    this.logger.debug(
      `Latest Block of ${chainName}: ${latestBlock.number},${latestBlock.hash}`,
    );

    if (!this.deployment_latest_block) {
      this.deployment_latest_block = await get_deployment_latest_block(
        this.deployment.id,
      );
    }
    this.logger.debug(
      `Deployment ${this.deployment.deployment} Latest Block: ${this.deployment_latest_block}`,
    );

    if (
      this.deployment_latest_block &&
      this.deployment_latest_block >= latestBlock.number
    ) {
      return { state: ReconciliationStep.Done };
    }

    // Start with first block after subgraph ptr; if the ptr is None,
    // then we start with the genesis block
    let from = this.deployment_latest_block
      ? this.deployment_latest_block + 1
      : 0;

    if (
      !this.deployment_latest_block ||
      latestBlock.number - this.deployment_latest_block >=
        indexer_config.REORG_THRESHOLD
    ) {
      let to_limit = latestBlock.number - indexer_config.REORG_THRESHOLD;

      // Calculate the range size according to the target number of triggers,
      // respecting the global maximum and also not increasing too
      // drastically from the previous block range size.
      //
      // An example of the block range dynamics:
      // - Start with a block range of 1, target of 1000.
      // - Scan 1 block:
      //   0 triggers found, max_range_size = 10, range_size = 10
      // - Scan 10 blocks:
      //   2 triggers found, 0.2 per block, range_size = 1000 / 0.2 = 5000
      // - Scan 5000 blocks:
      //   10000 triggers found, 2 per block, range_size = 1000 / 2 = 500
      // - Scan 500 blocks:
      //   1000 triggers found, 2 per block, range_size = 1000 / 2 = 500
      let range_size_upper_limit = Math.min(
        this.max_block_range_size,
        this.previous_block_range_size * 10,
      );

      let range_size = range_size_upper_limit;

      if (this.previous_triggers_per_block != 0) {
        range_size = Math.min(
          Math.max(
            this.target_triggers_per_block_range /
              this.previous_triggers_per_block,
            1,
          ),
          range_size_upper_limit,
        );
      }
      let to = Math.min(from + range_size - 1, to_limit);

      this.logger.debug(
        `Scanning blocks [${from}, ${to}]" <-> range_size => ${range_size}`,
      );

      if (this.deployment.contract && this.deployment.filters) {
        let blocks = await this.scan_triggers(
          this.deployment.contract,
          from,
          to,
          this.deployment.filters,
        );

        return {
          state: ReconciliationStep.ProcessDescendantBlocks,
          data: {
            blocks_with_triggers: blocks,
            range_size,
          },
        };
      }
    }
  }

  private async scan_triggers(
    contract: string,
    from: number,
    to: number,
    filters: ITriggerFilters,
  ) {
    const indexer_config = IndexerConfig.getInstance();

    let log_filters: EthGetLogsFilter[] = [];
    let filter = EthGetLogsFilter.from_contract(contract);
    Object.keys(filters).map((event_sig: string) => {
      filter.event_signatures.push(`${String(event_sig)}`);
    });

    log_filters.push(filter);

    if (from > to) {
      this.logger.debug(
        `cannot produce a log stream on a backwards block range (from=${BigNumber.from(
          from,
        ).toNumber()}, to=${BigNumber.from(to).toNumber()})`,
      );
      return;
    }

    let logs: any[] = [];

    for (let filter of log_filters) {
      let step = to - from;
      if (filter.contracts.length == 0) {
        step = Math.min(
          to - from,
          indexer_config.ETHEREUM_MAX_EVENT_ONLY_RANGE - 1,
        );
      }

      let start = from;

      while (start <= to) {
        const get_logs = (start: number, end: number) => async () => {
          let start_calling = Date.now();
          let result = await callRPCRawMethod(
            this.deployment.chain_id,
            "eth_getLogs",
            [
              {
                fromBlock: `0x${start.toString(16)}`,
                toBlock: `0x${end.toString(16)}`,
                topics: [[...filter.event_signatures]],
                address: filter.contracts,
              },
            ],
          );

          let elapsed = Date.now() - start_calling;
          this.logger.info(
            `Requesting logs for blocks [${start}, ${end}], ${filter} elapsed ${elapsed}`,
          );
          return result;
        };

        const log_triggers = await this.requesting_block(
          get_logs,
          start,
          to,
          step,
          filters,
        );

        start = log_triggers.start;
        step = log_triggers.step;
        logs.push(...log_triggers.logs);
      }
    }

    let to_hash;
    let triggers_by_block = new Map();

    logs.forEach((log) => {
      if (!triggers_by_block.get(log.blockNumber)) {
        triggers_by_block.set(log.blockNumber, []);
      }

      triggers_by_block.set(log.blockNumber, [
        ...triggers_by_block.get(log.blockNumber),
        log,
      ]);
    });

    let block_hashes = new Set(logs.map((log) => log.blockHash));

    try {
      to_hash = await this.adapter.get_block_hash_by_block_number(to);
      block_hashes.add(to_hash);
    } catch (err) {
      this.logger.warn(`"Block {} not found in the chain", ${to})`);
    }

    this.logger.info(`Found ${block_hashes.size} relevant block(s)`);

    let blocks: Block[] = await this.adapter.load_blocks_rpc(
      Array.from(block_hashes),
    );

    let blocks_with_triggers = blocks.map((block) => {
      const triggers = triggers_by_block.get(block.number);
      if (!triggers) {
        // throw new Error(
        //   `block ${BigNumber.from(
        //     block.number,
        //   ).toString()} not found in \`triggers_by_block\``,
        // );
        return {
          block,
          triggers: [],
        };
      }

      return {
        block,
        triggers,
      };
    });

    blocks_with_triggers = blocks_with_triggers.sort(
      (first, sec) => first.block.number - sec.block.number,
    );
    return blocks_with_triggers;
  }

  private async requesting_block(
    cb: (start: number, end: number) => Function,
    start: number,
    to: number,
    step: number,
    filters: ITriggerFilters,
  ): Promise<{ logs: any; start: number; step: number }> {
    let end = Math.min(start + step, to);
    this.logger.info(
      `Requesting logs for blocks [${start}, ${end}], ${filters}`,
    );

    try {
      let retry_log_message = `eth_getLogs RPC call for block range: [${start}..${end}]`;

      let retry = new RetryConfig(
        retry_log_message,
        this.logger,
        TOO_MANY_LOGS_FINGERPRINTS,
      );

      return { logs: await retry.run(cb(start, end)()), start: end + 1, step };
    } catch (err: any) {
      // console.log(err.message);
      if (err.name === "RequestLimitErr" && step > 0) {
        // The range size for a request is `step + 1`. So it's ok if the step
        // goes down to 0, in that case we'll request one block at a time.
        let new_step = step / 10;
        this.logger.info(
          `Reducing block range size to scan for events, new_size ${
            new_step + 1
          }`,
        );

        return this.requesting_block(cb, start, to, new_step, filters);
      } else if (err.name === "IntolerantErr") {
        this.logger.warn(`Unexpected RPC error: ${err.inner}`);
        throw err;
      }

      this.logger.warn(`Have no idea what error it is !!!`);
      return { logs: [], start, step };
    }
  }

  private async next_blocks(): Promise<NextBlockReturns> {
    while (true) {
      let result = await this.get_next_step();

      if (result?.state === ReconciliationStep.ProcessDescendantBlocks) {
        return {
          state: NextBlockReturnsState.NextBlocks,
          data: result.data,
        };
      }

      if (result?.state === ReconciliationStep.Retry) {
        continue;
      }

      if (result?.state === ReconciliationStep.Done) {
        return { state: NextBlockReturnsState.Done };
      }

      return { state: NextBlockReturnsState.Revert };
    }
  }

  private async process_block(block_with_triggers: BlockWithTriggers) {
    await update_latest_ethereum_block(
      this.deployment.id,
      block_with_triggers.block,
    );
  }

  public async start() {
    // while (true) {
    // while (true) {
    let { state, next_blocks } = this.index_state;
    switch (state) {
      case BlockStreamState.BeginReconciliation: {
        try {
          let next_blocks = await this.next_blocks();
          this.index_state = {
            state: BlockStreamState.Reconciliation,
            next_blocks,
          };
        } catch (err: any) {
          this.logger.warn(err.message);
          this.consecutive_err_count += 1;
          this.previous_triggers_per_block =
            STARTING_PREVIOUS_TRIGGERS_PER_BLOCK;
          await wait(Math.max(120, 5 * this.consecutive_err_count) * 1000);

          this.index_state = {
            state: BlockStreamState.RetryAfterDelay,
          };
        }

        break;
      }

      case BlockStreamState.Reconciliation: {
        let { next_blocks } = this.index_state;
        if (next_blocks) {
          if (
            next_blocks.state === NextBlockReturnsState.NextBlocks &&
            next_blocks.data
          ) {
            let { range_size, blocks_with_triggers } = next_blocks.data;
            // We had only one error, so we infer that reducing the range size is
            // what fixed it. Reduce the max range size to prevent future errors.
            // See: 018c6df4-132f-4acc-8697-a2d64e83a9f0
            if (this.consecutive_err_count == 1) {
              // Reduce the max range size by 10%, but to no less than 10.
              this.max_block_range_size = Math.max(
                (this.max_block_range_size * 9) / 10,
                10,
              );
            }
            this.consecutive_err_count = 0;
            let total_triggers = blocks_with_triggers.reduce(
              (total, block) => total + block.triggers.length,
              0,
            );

            this.previous_triggers_per_block = total_triggers / range_size;
            this.previous_block_range_size = range_size;

            if (total_triggers > 0) {
              this.logger.debug(`Processing ${total_triggers} triggers`);
            }

            this.index_state = {
              state: BlockStreamState.YieldingBlocks,
              next_blocks,
            };
          }

          if (next_blocks.state === NextBlockReturnsState.Done) {
            // Reset error count
            this.consecutive_err_count = 0;

            // Switch to idle
            this.index_state = {
              state: BlockStreamState.Idle,
            };
            // Poll for chain head update
            break;
          }

          if (next_blocks.state === NextBlockReturnsState.Revert) {
            this.index_state = {
              state: BlockStreamState.BeginReconciliation,
            };
          }
        }

        break;
      }

      case BlockStreamState.YieldingBlocks: {
        let { next_blocks } = this.index_state;
        if (next_blocks?.data) {
          let { blocks_with_triggers } = next_blocks.data;
          for (let block_with_triggers of blocks_with_triggers) {
            this.deployment_latest_block = BigNumber.from(
              block_with_triggers.block.number,
            ).toNumber();
            await this.process_block(block_with_triggers);
          }

          this.index_state = {
            state: BlockStreamState.BeginReconciliation,
          };
        }

        break;
      }

      case BlockStreamState.RetryAfterDelay: {
        this.index_state = {
          state: BlockStreamState.BeginReconciliation,
        };

        break;
      }
      // }
      // }
      // }
      // Only one invocation should be runget_next_stepning per chain
      // let isIndexing = await redisClient.get(`${chainName}_IS_INDEXING_FORWARD`);
      // if (isIndexing === 'true') {
      //   logger.debug(`already in progress, skipping interval call.`);
      //   return;
      // }
      // // Release lock in about 5 minutes, incase of restart while locked
      // let forwardTimeout = 300;
      // logger.info(`Setting timeout ${forwardTimeout}`);
      // await redisClient.set(
      //   `${chainName}_IS_INDEXING_FORWARD`,
      //   'true',
      //   'EX',
      //   forwardTimeout,
      // );
      // try {
      //   // Get the current RPC url index
      //   let cachedRpcIndex = await redisClient.get(
      //     `${chainName}_INDEXING_FORWARD_RPC_INDEX`,
      //   );
      //   let rpcIndex = cachedRpcIndex ? Number(cachedRpcIndex) : 0; // 0 as default
      //   let provider = getRPCProvider(chainConfig.id, rpcIndex);
      //   logger.debug(`start indexing forward`);
      //   // Get block intervals to get events between
      //   let networkLatestBlock = await provider.getBlockNumber();
      //   let cachedLatestBlock = await redisClient.get(
      //     `${chainName}_LATEST_BLOCK_INDEXED`,
      //   );
      //   let indexedLatestBlock = cachedLatestBlock
      //     ? parseInt(cachedLatestBlock)
      //     : networkLatestBlock;
      //   let maxBlockToIndexUntil = Math.min(
      //     networkLatestBlock,
      //     indexedLatestBlock + FORWARD_BLOCK_INTERVAL,
      //   );
      //   logger.debug(`network latest block: ${networkLatestBlock}`);
      //   logger.debug(`indexed latest block: ${indexedLatestBlock}`);
      //   logger.debug(`indexing until block: ${maxBlockToIndexUntil}`);
      //   // // Initialize Deposit Contract
      //   let stakingContractAddress = ethers.utils.getAddress(chainConfig.contract);
      //   let stakingContract = buildTokenContract(
      //     stakingContractAddress,
      //     getMasterChefAbi(),
      //     provider,
      //   );
      //   // Get events between these blocks
      //   let filteredEvents = await stakingContract.queryFilter(
      //     {
      //       address: stakingContractAddress,
      //       topics: getTopicsHash(),
      //     },
      //     indexedLatestBlock,
      //     maxBlockToIndexUntil,
      //   );
      //   // Process received events
      //   let startTime = getEpochSeconds();
      //   // try {
      //   await processEvents(chainConfig, filteredEvents);
      //   // } catch (err) {
      //   // logger.warn(err);
      //   // }
      //   let endTime = getEpochSeconds();
      //   logger.debug(`processing took ${endTime - startTime} seconds`);
      //   // Update the latest block processed for chain
      //   await redisClient.set(
      //     `${chainName}_LATEST_BLOCK_INDEXED`,
      //     maxBlockToIndexUntil,
      //   );
      //   await redisClient.set(`${chainName}_IS_INDEXING_FORWARD`, 'false');
      // } catch (err) {
      //   logger.error(err);
      //   await redisClient.set(`${chainName}_IS_INDEXING_FORWARD`, 'false');
    }
  }
}
