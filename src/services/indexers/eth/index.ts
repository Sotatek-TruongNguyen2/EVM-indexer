import PubSub from "pubsub-js";
import { BigNumber, ethers } from "ethers";
import { Log } from "@ethersproject/abstract-provider";

// import Piscina from "piscina";

import { ChainConfig } from "../../../config/chainConfig";
import { getIndexerLogger } from "../../../utils/logger";
// import { callRPCRawMethod } from "../../../utils/rpcRequest";
import {
  IndexerConfig,
  STARTING_PREVIOUS_TRIGGERS_PER_BLOCK,
} from "../../../config/indexer";
import {
  get_deployment_latest_block,
  set_synced,
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
import {
  ReconciliationStep,
  BlockStreamState,
  NextBlockReturnsState,
  IndexingState,
  NextBlockReturns,
  BlockWithTriggers,
  NextBlocks,
} from "../types";
import { getHandlerByName } from "../../handlers";

import { TOO_MANY_LOGS_FINGERPRINTS } from "../../errors";
import { EthGetLogsFilter } from "../../filters";
import { ChainStore } from "../../store/chain_head_store";
import { BlockPtr } from "../../../types";
import { ChangeStream } from "mongodb";
import { IEthereumBlock } from "../../../models/ethereum-block.model";
import { Topics } from "../../pubsub/topics";
import { LogWithSender } from "../../../interfaces";
import { callRPCRawMethod } from "../../../utils/rpcRequest";

export class IndexForward {
  private _previous_triggers_per_block: number;
  private _previous_block_range_size: number;
  private _max_block_range_size: number;
  private _target_triggers_per_block_range: number;
  private _consecutive_err_count: number;
  private _block_polling_interval: number;
  private _index_state: IndexingState<IEthereumBlock>;
  private _chain_store: ChainStore;
  private _deployment_latest_block: BlockPtr | undefined;

  private _logger: Logger;
  private _deployment: IContractDeployment;
  private _adapter: ETHAdapter;
  private _chain_head_emitter: any;

  constructor(deployment: IContractDeployment, chain_store: ChainStore) {
    const indexer_config = IndexerConfig.getInstance();

    this._chain_store = chain_store;
    this._index_state = { state: BlockStreamState.BeginReconciliation };
    this._consecutive_err_count = 0;
    this._target_triggers_per_block_range =
      indexer_config.TARGET_TRIGGERS_PER_BLOCK_RANGE;
    this._previous_triggers_per_block = STARTING_PREVIOUS_TRIGGERS_PER_BLOCK;
    this._previous_block_range_size = 1;
    this._max_block_range_size = indexer_config.ETHEREUM_MAX_BLOCK_RANGE_SIZE;
    this._block_polling_interval = indexer_config.NEW_BLOCK_POLLING_INTERVAL;
    this._deployment = deployment;

    this._adapter = new ETHAdapter(deployment.chain_id, this.chain_store);

    const chainConfig = ChainConfig[this.deployment.chain_id as number];

    this._logger = getIndexerLogger(
      `${chainConfig.name}_${deployment.deployment}_${IndexForward.name}`,
    );
  }

  public set deployment_latest_block(
    deployment_latest_block: BlockPtr | undefined,
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

  public set index_state(index_state: IndexingState<IEthereumBlock>) {
    this._index_state = index_state;
  }

  public set consecutive_err_count(consecutive_err_count: number) {
    this._consecutive_err_count = consecutive_err_count;
  }

  public set chain_head_emitter(chain_head_emitter: any) {
    this._chain_head_emitter = chain_head_emitter;
  }

  // public get pool(): Piscina {
  //   return this._pool;
  // }

  public get chain_head_emitter(): ChangeStream {
    return this._chain_head_emitter;
  }

  public get chain_store(): ChainStore {
    return this._chain_store;
  }

  public get adapter(): ETHAdapter {
    return this._adapter;
  }

  public get block_polling_interval(): number {
    return this._block_polling_interval;
  }

  public get deployment_latest_block(): BlockPtr | undefined {
    return this._deployment_latest_block;
  }

  public get index_state(): IndexingState<IEthereumBlock> {
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

    // let chainName = chainConfig.name;
    // let redisClient = await RedisConnection.getClient();

    let chain_head_ptr = await this.chain_store.chain_head_ptr();

    if (!chain_head_ptr) {
      return {
        state: ReconciliationStep.Done,
      };
    }

    if (!this.deployment_latest_block) {
      this.deployment_latest_block = await get_deployment_latest_block(
        this.deployment.id,
      );
    }
    this.logger.debug(
      `Deployment ${this.deployment.deployment} Latest Block: ${this.deployment_latest_block?.number}`,
    );

    // Subgraph ptr is behind head ptr.
    // Let's try to move the subgraph ptr one step in the right direction.
    // First question: which direction should the ptr be moved?
    //
    // We will use a different approach to deciding the step direction depending on how far
    // the subgraph ptr is behind the head ptr.
    //
    // Normally, we need to worry about chain reorganizations -- situations where the
    // Ethereum client discovers a new longer chain of blocks different from the one we had
    // processed so far, forcing us to rollback one or more blocks we had already
    // processed.
    // We can't assume that blocks we receive are permanent.
    //
    // However, as a block receives more and more confirmations, eventually it becomes safe
    // to assume that that block will be permanent.
    // The probability of a block being "uncled" approaches zero as more and more blocks
    // are chained on after that block.
    // Eventually, the probability is so low, that a block is effectively permanent.
    // The "effectively permanent" part is what makes blockchains useful.
    // See here for more discussion:
    // https://blog.ethereum.org/2016/05/09/on-settlement-finality/
    //
    // Accordingly, if the subgraph ptr is really far behind the head ptr, then we can
    // trust that the Ethereum node knows what the real, permanent block is for that block
    // number.
    // We'll define "really far" to mean "greater than reorg_threshold blocks".
    //
    // If the subgraph ptr is not too far behind the head ptr (i.e. less than
    // reorg_threshold blocks behind), then we have to allow for the possibility that the
    // block might be on the main chain now, but might become uncled in the future.
    //
    // Most importantly: Our ability to make this assumption (or not) will determine what
    // Ethereum RPC calls can give us accurate data without race conditions.
    // (This is mostly due to some unfortunate API design decisions on the Ethereum side)
    if (
      this.deployment_latest_block &&
      this.deployment_latest_block.number >= chain_head_ptr.number
    ) {
      return { state: ReconciliationStep.Done };
    }

    // Start with first block after subgraph ptr; if the ptr is None,
    // then we start with the genesis block
    let from = this.deployment_latest_block
      ? this.deployment_latest_block.number + 1
      : 0;

    if (
      !this.deployment_latest_block ||
      chain_head_ptr.number - this.deployment_latest_block.number >
        indexer_config.REORG_THRESHOLD
    ) {
      // Since we are beyond the reorg threshold, the Ethereum node knows what block has
      // been permanently assigned this block number.
      // This allows us to ask the node: does subgraph_ptr point to a block that was
      // permanently accepted into the main chain, or does it point to a block that was
      // uncled?
      let is_on_main_chain = true;

      if (this.deployment_latest_block) {
        is_on_main_chain = await this.adapter.is_on_main_chain(
          this.deployment_latest_block,
        );
      }

      if (!is_on_main_chain) {
        // The subgraph ptr points to a block that was uncled.
        // We need to revert this block.
        //
        // Note: We can safely unwrap the subgraph ptr here, because
        // if it was `None`, `is_on_main_chain` would be true.
        let parent_ptr = this.parent_ptr(this.deployment_latest_block!);

        return {
          state: ReconciliationStep.Revert,
          data: parent_ptr,
        };
      }

      let to_limit = chain_head_ptr.number - indexer_config.REORG_THRESHOLD;

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
            Math.floor(
              this.target_triggers_per_block_range /
                this.previous_triggers_per_block,
            ),
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
    } else {
      // console.log("START RUNNING INTO ANCESTOR");
      // The subgraph ptr is not too far behind the head ptr.
      // This means a few things.
      //
      // First, because we are still within the reorg threshold,
      // we can't trust the Ethereum RPC methods that use block numbers.
      // Block numbers in this region are not yet immutable pointers to blocks;
      // the block associated with a particular block number on the Ethereum node could
      // change under our feet at any time.
      //
      // Second, due to how the BlockIngestor is designed, we get a helpful guarantee:
      // the head block and at least its reorg_threshold most recent ancestors will be
      // present in the block store.
      // This allows us to work locally in the block store instead of relying on
      // Ethereum RPC calls, so that we are not subject to the limitations of the RPC
      // API.
      // To determine the step direction, we need to find out if the subgraph ptr refers
      // to a block that is an ancestor of the head block.
      // We can do so by walking back up the chain from the head block to the appropriate
      // block number, and checking to see if the block we found matches the
      // subgraph_ptr.

      if (!this.deployment_latest_block) {
        this.logger.debug(`indexer block pointer should not be \`Null\` here`);
        return;
      }

      // Precondition: subgraph_ptr.number < head_ptr.number
      // Walk back to one block short of subgraph_ptr.number
      let offset =
        chain_head_ptr.number - this.deployment_latest_block.number - 1;
      let ancestor_block = await this.chain_store.ancestor_block(
        {
          hash: chain_head_ptr.hash,
          number: chain_head_ptr.number,
        },
        offset,
      );

      // console.log(offset, this.deployment_latest_block, ancestor_block);

      if (!ancestor_block) {
        // Block is missing in the block store.
        // This generally won't happen often, but can happen if the head ptr has
        // been updated since we retrieved the head ptr, and the block store has
        // been garbage collected.
        // It's easiest to start over at this point.
        return {
          state: ReconciliationStep.Retry,
        };
      }

      // We stopped one block short, so we'll compare the parent hash to the
      // subgraph ptr.
      if (ancestor_block?.parent_hash === this.deployment_latest_block?.hash) {
        // The subgraph ptr is an ancestor of the head block.
        // We cannot use an RPC call here to find the first interesting block
        // due to the race conditions previously mentioned,
        // so instead we will advance the subgraph ptr by one block.
        // Note that head_ancestor is a child of subgraph_ptr.
        let block = await this.block_with_triggers(
          ancestor_block,
          this.deployment.filters,
        );

        return {
          state: ReconciliationStep.ProcessDescendantBlocks,
          data: {
            range_size: 1,
            blocks_with_triggers: [block],
          },
        };
      } else {
        let parent_ptr = await this.parent_ptr(this.deployment_latest_block);
        return {
          state: ReconciliationStep.Revert,
          data: parent_ptr,
        };
      }
    }
  }

  public async start() {
    try {
      let { state } = this.index_state;
      let previous_state = state;
      switch (state) {
        case BlockStreamState.BeginReconciliation: {
          if (this.chain_head_emitter) {
            PubSub.unsubscribe(this.chain_head_emitter);
            this.chain_head_emitter = null;
          }

          let next_blocks = await this.next_blocks();
          this.index_state = {
            state: BlockStreamState.Reconciliation,
            next_blocks,
          };
          break;
        }

        case BlockStreamState.Reconciliation: {
          // try {
          let { next_blocks } = this.index_state;
          if (next_blocks) {
            switch (next_blocks.state) {
              case NextBlockReturnsState.NextBlocks: {
                if (next_blocks.data) {
                  let { range_size, blocks_with_triggers } =
                    next_blocks.data as NextBlocks<IEthereumBlock>;
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

                  this.previous_triggers_per_block =
                    total_triggers / range_size;
                  this.previous_block_range_size = range_size;

                  if (total_triggers > 0) {
                    this.logger.debug(`Processing ${total_triggers} triggers`);
                  }

                  this.index_state = {
                    state: BlockStreamState.YieldingBlocks,
                    next_blocks,
                  };
                }

                break;
              }
              case NextBlockReturnsState.Done: {
                // Reset error count
                this.consecutive_err_count = 0;

                // Switch to idle
                this.index_state = {
                  state: BlockStreamState.Idle,
                };
                // Poll for chain head update
                break;
              }
              case NextBlockReturnsState.Revert: {
                if (next_blocks.data) {
                  const data = next_blocks.data as BlockPtr;
                  this.index_state = {
                    state: BlockStreamState.BeginReconciliation,
                  };
                  this.deployment_latest_block = {
                    number: data.number,
                    hash: data.hash,
                  };
                }

                break;
              }
            }
          }
          // } catch (err: any) {
          //   this.logger.warn(err.message);
          //   this.consecutive_err_count += 1;
          //   this.previous_triggers_per_block =
          //     STARTING_PREVIOUS_TRIGGERS_PER_BLOCK;
          //   await wait(Math.max(120, 5 * this.consecutive_err_count) * 1000);

          //   this.index_state = {
          //     state: BlockStreamState.RetryAfterDelay,
          //   };
          // }
        }

        case BlockStreamState.YieldingBlocks: {
          let { next_blocks } = this.index_state;
          if (next_blocks?.data) {
            let { blocks_with_triggers } =
              next_blocks.data as NextBlocks<IEthereumBlock>;
            for (let block_with_triggers of blocks_with_triggers) {
              this.deployment_latest_block = {
                number: BigNumber.from(
                  block_with_triggers.block.block_number,
                ).toNumber(),
                hash: block_with_triggers.block.block_hash,
              };

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

        case BlockStreamState.Idle: {
          this.chain_head_emitter = PubSub.subscribe(
            Topics.CHAIN_HEAD_STORE_UPDATE,
            async (msg, data) => {
              if (msg === Topics.CHAIN_HEAD_STORE_UPDATE && data) {
                this.index_state = {
                  state: BlockStreamState.BeginReconciliation,
                };

                this.start();
              }
            },
          );

          break;
        }
      }

      if (
        this.index_state.state != BlockStreamState.Idle ||
        (this.index_state.state == BlockStreamState.Idle &&
          previous_state != BlockStreamState.Idle)
      ) {
        this.start();
      }
    } catch (err: any) {
      this.logger.warn(err.message);
      this.consecutive_err_count += 1;
      this.previous_triggers_per_block = STARTING_PREVIOUS_TRIGGERS_PER_BLOCK;
      await wait(Math.max(120, 5 * this.consecutive_err_count) * 1000);

      this.index_state = {
        state: BlockStreamState.RetryAfterDelay,
      };

      this.start();
    }
  }

  private async scan_triggers(
    contract: string,
    from: number,
    to: number,
    filters: ITriggerFilters,
  ): Promise<BlockWithTriggers<IEthereumBlock>[] | undefined> {
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

    let logs: Log[] = [];

    for (let filter of log_filters) {
      // `to - from + 1`  blocks will be scanned.

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
          let result = await callRPCRawMethod({
            chainId: this.deployment.chain_id,
            method: "eth_getLogs",
            params: [
              {
                fromBlock: `0x${start.toString(16)}`,
                toBlock: `0x${end.toString(16)}`,
                topics: [[...filter.event_signatures]],
                address: filter.contracts,
              },
            ],
            logger: this.logger,
          });

          // let result = await this.pool.run(
          //   {
          //     chainId: this.deployment.chain_id,
          //     method: "eth_getLogs",
          //     params: [
          //       {
          //         fromBlock: `0x${start.toString(16)}`,
          //         toBlock: `0x${end.toString(16)}`,
          //         topics: [[...filter.event_signatures]],
          //         address: filter.contracts,
          //       },
          //     ],
          //     // logger: this.logger,
          //   },
          //   { name: "callRPCRawMethod" },
          // );

          let elapsed = Date.now() - start_calling;
          this.logger.info(
            `Requesting logs for blocks [${start}, ${end}], ${JSON.stringify(
              filter,
            )} elapsed ${elapsed}`,
          );
          return result;
        };

        const log_triggers = await this.requesting_logs_in_range(
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

    let block_hashes = new Set(logs.map((log) => log.blockHash));

    let to_hash;
    try {
      to_hash = await this.adapter.get_block_hash_by_block_number(to);
      block_hashes.add(to_hash);
    } catch (err) {
      this.logger.warn(`"Block {} not found in the chain", ${to})`);
    }

    this.logger.info(`Found ${block_hashes.size} relevant block(s)`);

    let blocks: IEthereumBlock[] = await this.adapter.load_blocks(
      Array.from(block_hashes),
      this.chain_store,
    );

    let triggers_by_block = new Map<number, LogWithSender[]>();
    // blocks.forEach((block) => {
    //   const log_block_number = Number(block.block_number);

    //   if (!triggers_by_block.get(log_block_number)) {
    //     triggers_by_block.set(log_block_number, []);
    //   }

    //   triggers_by_block.set(log_block_number, [
    //     ...(triggers_by_block.get(log_block_number) as LogWithSender[]),
    //     ...block.data.logs[],
    //   ]);
    // });

    let blocks_with_logs = new Map<number, LogWithSender>();

    blocks.forEach((block) => {
      if (!blocks_with_logs.get(block.block_number)) {
        blocks_with_logs.set(block.block_number, block.data.logs);
      }
    });

    logs.forEach((log) => {
      const log_block_number = Number(log.blockNumber);
      if (!triggers_by_block.get(log_block_number)) {
        triggers_by_block.set(log_block_number, []);
      }

      if (blocks_with_logs.get(log_block_number)) {
        triggers_by_block.set(log_block_number, [
          ...(triggers_by_block.get(log_block_number) as LogWithSender[]),
          blocks_with_logs.get(log_block_number)![Number(log.logIndex)],
        ]);
      }
    });

    let blocks_with_triggers = blocks.map((block) => {
      const triggers = triggers_by_block.get(block.block_number);
      if (!triggers) {
        this.logger.debug(
          `block ${BigNumber.from(
            block.block_number,
          ).toString()} not found in \`triggers_by_block\``,
        );
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
      (first, sec) => first.block.block_number - sec.block.block_number,
    );
    return blocks_with_triggers;
  }

  private async requesting_logs_in_range(
    cb: (start: number, end: number) => Function,
    start: number,
    to: number,
    step: number,
    filters: ITriggerFilters,
  ): Promise<{ logs: Log[]; start: number; step: number }> {
    let end = Math.min(start + step, to);
    this.logger.info(
      `Requesting logs for blocks [${start}, ${end}], ${JSON.stringify(
        filters,
      )}`,
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

        return this.requesting_logs_in_range(cb, start, to, new_step, filters);
      } else if (err.name === "IntolerantErr") {
        this.logger.warn(`Unexpected RPC error: ${err.inner}`);
        throw err;
      }

      this.logger.warn(`Have no idea what error it is !!!`);
      return { logs: [], start, step };
    }
  }

  private async next_blocks(): Promise<NextBlockReturns<IEthereumBlock>> {
    while (true) {
      let result = await this.get_next_step();
      switch (result?.state) {
        case ReconciliationStep.ProcessDescendantBlocks: {
          return {
            state: NextBlockReturnsState.NextBlocks,
            data: result.data,
          };
        }

        case ReconciliationStep.Done: {
          return { state: NextBlockReturnsState.Done };
        }

        case ReconciliationStep.Retry: {
          continue;
        }

        case ReconciliationStep.Revert: {
          return {
            state: NextBlockReturnsState.Revert,
            data: result.data,
          };
        }
      }
    }
  }

  private async process_block(
    block_with_triggers: BlockWithTriggers<IEthereumBlock>,
  ) {
    // We consider a deployment synced when it's at most 1 block behind the
    // chain head.
    const close_to_chain_head = await this.close_to_chain_head(1);
    if (close_to_chain_head && !this.deployment.synced) {
      await set_synced(this.deployment.id, true);
    }

    this.logger.info(
      `${block_with_triggers.triggers.length} candidate trigger in this block`,
    );

    if (block_with_triggers.triggers.length > 0) {
      const handlers = this.deployment.handlers;
      // const abi = new ethers.utils.Interface(this.deployment.abi);
      for (let trigger of block_with_triggers.triggers) {
        const handler_sig = handlers.get(trigger.topics[0]);
        if (handler_sig) {
          const handler = getHandlerByName(handler_sig);

          this.logger.info(
            `Start processing trigger, handler => ${handler_sig}`,
          );

          const start_time = new Date().getTime();

          try {
            await handler(this.logger, {
              raw_log: trigger,
              metadata: {
                timestamp: block_with_triggers.block.timestamp,
                block_number: block_with_triggers.block.block_number,
              },
            });

            const elapsed = new Date().getTime() - start_time;

            this.logger.info(
              `Done processing trigger, total_ms: ${elapsed}, handler: ${handler_sig}`,
            );
          } catch (err: any) {
            this.logger.warn(
              `Error when processing ${handler.name} => ${err.message}`,
            );
          }
        }
      }
    }

    await update_latest_ethereum_block(this.deployment.id, {
      number: block_with_triggers.block.block_number,
      hash: block_with_triggers.block.block_hash,
    });
  }

  private async block_with_triggers(
    block: IEthereumBlock,
    filter: ITriggerFilters,
  ): Promise<BlockWithTriggers<IEthereumBlock> | undefined> {
    if (block.finalized) {
      const blocks = await this.scan_triggers(
        this.deployment.contract,
        block.block_number,
        block.block_number,
        filter,
      );

      if (blocks && blocks.length === 1) {
        return blocks[0];
      }
    } else {
      const triggers: Log[] = [];
      const block_data = block.data as { logs: Log[]; timestamp: number };
      Object.keys(filter).map((first_topic) => {
        for (let log of block_data.logs) {
          if (
            // Use checksum address to prevent error
            ethers.utils.getAddress(log.address) ===
              ethers.utils.getAddress(this.deployment.contract) &&
            log.topics[0] === first_topic
          ) {
            triggers.push(log);
          }
        }
      });

      return {
        block,
        triggers,
      };
    }
  }

  private async parent_ptr(block: BlockPtr): Promise<BlockPtr | undefined> {
    const blocks = await this.adapter.load_blocks(
      [block.hash],
      this.chain_store,
    );

    if (blocks.length === 1) {
      return {
        number: blocks[0].block_number - 1,
        hash: blocks[0].parent_hash,
      };
    }

    throw new Error("Not found parent pointer for this block!!!");
  }
  private async close_to_chain_head(n: number) {
    const chain_head_ptr = await this.chain_store.cached_chain_head();
    const deployment_ptr = this.deployment_latest_block;

    if (chain_head_ptr && deployment_ptr) {
      return chain_head_ptr.ptr.number - deployment_ptr.number <= n;
    }

    return false;
  }
}
