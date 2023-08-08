import { Logger } from "winston";
import PubSub from "pubsub-js";
import Redis from "ioredis/built/Redis";
import { BigNumber } from "ethers";
import { ChainHeadStore } from "../../models/chain-head.model";
import { getIndexerLogger } from "../../utils/logger";
import { ChainConfig } from "../../config/chainConfig";
import { IndexerConfig } from "../../config/indexer";
import { RedisConnection } from "../../caching/redis";
import {
  EthereumBlocks,
  IEthereumBlock,
} from "../../models/ethereum-block.model";
import {
  BlockPtr,
  BlockWithLogs,
  CacheBlockPtr,
  ChainHeadPtr,
} from "../../types";
import { Topics } from "../pubsub/topics";

export class ChainStore {
  private _CACHED_KEY: string;
  private _logger: Logger;
  private _chain_id: number;
  private _ancestor_count: number;
  private _capacity: number;
  private _polling_interval: number;
  private _redis_client: Redis;

  constructor(chain_id: number) {
    const indexer_config = IndexerConfig.getInstance();

    this._polling_interval = indexer_config.INGESTOR_POLLING_INTERVAL;
    this._redis_client = RedisConnection.getClient();
    this._capacity = indexer_config.CHAIN_STORE_RECENT_BLOCKS_CACHE_CAPACITY;
    this._ancestor_count = indexer_config.REORG_THRESHOLD;
    this._chain_id = chain_id;
    this._CACHED_KEY = `ChainStore__${chain_id}`;
    const chainConfig = ChainConfig[chain_id as number];
    if (chainConfig) {
      this._logger = getIndexerLogger(`${chainConfig.name}_chain_head_ptr`);
    }
  }

  public get CACHED_KEY(): string {
    return this._CACHED_KEY;
  }

  public get polling_interval(): number {
    return this._polling_interval;
  }

  public get capacity(): number {
    return this._capacity;
  }

  public get ancestor_count(): number {
    return this._ancestor_count;
  }

  public get chain_id(): number {
    return this._chain_id;
  }

  public get redis_client(): Redis {
    return this._redis_client;
  }

  public get logger(): Logger {
    return this._logger;
  }

  public async attempt_chain_head_update(): Promise<string | undefined> {
    let head_block_number = -1;
    let chain_store = await ChainHeadStore.findOne({
      chain_id: this.chain_id,
    });

    if (chain_store) {
      head_block_number = chain_store.head_block_number;
    }
    let chain_head_candidates = await EthereumBlocks.find({})
      .where("number")
      .gt(head_block_number)
      .sort({
        block_number: -1,
      })
      .limit(1)
      .exec();

    if (chain_head_candidates.length) {
      let chain_head_candidate = chain_head_candidates[0];
      let first_block = chain_head_candidate.block_number - this.ancestor_count;
      let max_depth = this.ancestor_count;

      const missing_parent = await this.missing_parents(
        chain_head_candidate.block_hash,
        first_block,
        max_depth,
      );

      if (missing_parent) {
        return missing_parent;
      }

      await ChainHeadStore.updateOne(
        {
          $and: [{ chain_id: `${this.chain_id}` }],
        },
        {
          $set: {
            chain_id: `${this.chain_id}`,
            head_block_hash: `${chain_head_candidate.block_hash}`,
            head_block_number: `${BigNumber.from(
              chain_head_candidate.block_number,
            ).toNumber()}`,
            network_name: `${ChainConfig[this.chain_id as number].name}`,
          },
        },
        {
          upsert: true,
        },
      );

      this.logger.info(
        `Update Chain store head to block number: ${chain_head_candidate.block_number}`,
      );

      PubSub.publish(Topics.CHAIN_HEAD_STORE_UPDATE, {
        head_block_number: `${BigNumber.from(
          chain_head_candidate.block_number,
        ).toNumber()}`,
        head_block_hash: `${chain_head_candidate.block_hash}`,
        chain_id: `${this.chain_id}`,
      });
    }
  }

  public async upsert_block(block: BlockWithLogs): Promise<IEthereumBlock> {
    try {
      await this.insert_block(block);
      return (await EthereumBlocks.findOneAndUpdate(
        {
          $and: [
            { block_hash: `${block.hash}` },
            { block_number: `${BigNumber.from(block.number).toNumber()}` },
            { chain_id: `${this.chain_id}` },
          ],
        },
        {
          $set: {
            chain_id: `${this.chain_id}`,
            block_hash: `${block.hash}`,
            block_number: `${BigNumber.from(block.number).toNumber()}`,
            parent_hash: `${block.parentHash}`,
            network_name: `${ChainConfig[this.chain_id as number].name}`,
            data: {
              logs: block.logs,
              timestamp: block.timestamp,
            },
            finalized: block.finalized || false,
            timestamp: block.timestamp,
          },
        },
        {
          upsert: true,
          returnOriginal: false,
        },
      )) as any;
    } catch (err: any) {
      throw err;
    }
  }

  public async upsert_light_block(
    block: BlockWithLogs,
  ): Promise<IEthereumBlock> {
    return await this.upsert_block({
      ...block,
      // logs: [],
      finalized: true,
    });
  }

  public async chain_head_ptr(): Promise<ChainHeadPtr | undefined> {
    let chain_head = await ChainHeadStore.findOne({ chain_id: this.chain_id });

    if (chain_head) {
      return {
        number: chain_head.head_block_number,
        hash: chain_head.head_block_hash,
      };
    }

    this.logger.debug(
      "No head pointer has found. Maybe due to initialization!",
    );
  }

  public async ancestor_block(
    block_ptr: BlockPtr,
    offset: number,
  ): Promise<IEthereumBlock | undefined> {
    let cached_blocks = await this.redis_client.lrange(this.CACHED_KEY, 0, 20);
    if (cached_blocks) {
      for (let i = 0; i < cached_blocks.length; i++) {
        let tmp = JSON.parse(cached_blocks[i]);
        if (tmp.block_number === block_ptr.number - offset) {
          return tmp;
        }
      }
    }

    const related_blocks = await EthereumBlocks.aggregate([
      {
        $match: {
          block_hash: {
            $eq: block_ptr.hash,
          },
        },
      },
      {
        $graphLookup: {
          from: "ethereumblocks",
          connectFromField: "parent_hash",
          connectToField: "block_hash",
          as: "chain",
          startWith: "$block_hash",
          maxDepth: offset,
          restrictSearchWithMatch: {
            $and: [{ chain_id: this.chain_id }],
          },
        },
      },
      {
        $unwind: "$chain",
      },
      {
        $project: {
          _id: 0,
          chain: 1,
        },
      },
      {
        $group: {
          _id: "$chain._id",
          parent_hash: {
            $first: "$chain.parent_hash",
          },
          block_number: {
            $first: "$chain.block_number",
          },
          block_hash: {
            $first: "$chain.block_hash",
          },
          chain_id: {
            $first: "$chain.chain_id",
          },
          network_name: {
            $first: "$chain.network_name",
          },
          finalized: {
            $first: "$chain.finalized",
          },
          data: {
            $first: "$chain.data",
          },
        },
      },
      {
        $sort: { block_number: 1 },
      },
    ]);

    if (related_blocks.length - 1 === offset) {
      return related_blocks[0];
      // return {
      //   is_finalized: block.finalized,
      //   parent_hash: block.parent_hash,
      //   ptr: {
      //     hash: block.block_hash,
      //     number: block.block_number,
      //   },
      // };
    }

    return;
  }

  public async cached_chain_head(): Promise<CacheBlockPtr | null> {
    let cached_block = await this.redis_client.lindex(this.CACHED_KEY, "-1");
    if (cached_block) {
      return JSON.parse(cached_block) as CacheBlockPtr;
    }
    return null;
  }

  private async insert_block(block: BlockWithLogs) {
    // console.log("iNSERT BLOCK", block);
    if (block.parentHash) {
      let chain_head = await this.cached_chain_head();

      let cached_block: CacheBlockPtr = {
        is_finalized: false,
        parent_hash: block.parentHash,
        ptr: {
          hash: block.hash,
          number: BigNumber.from(block.number).toNumber(),
        },
      };

      if (!chain_head) {
        await this.redis_client.rpush(
          this.CACHED_KEY,
          JSON.stringify(cached_block),
        );
      } else {
        console.log("iNTESTING: ", chain_head.ptr, cached_block);
        if (chain_head.ptr.hash === cached_block.parent_hash) {
          // We have a new chain head that is a direct child of our
          // previous chain head, so we get to keep all items in the
          // cache.
          await this.redis_client.rpushx(
            this.CACHED_KEY,
            JSON.stringify(cached_block),
          );
        } else if (cached_block.ptr.number > chain_head.ptr.number) {
          // We have a new chain head, but it's not a direct child of
          // our previous chain head. This means that we must
          // invalidate all the items in the cache before inserting
          // this block.
          await this.redis_client.del(this.CACHED_KEY);
          await this.redis_client.rpushx(
            this.CACHED_KEY,
            JSON.stringify(cached_block),
          );
        } else {
          // Unwrap: we have checked already that the cache is not empty,
          // at the beginning of this function body.
          let earliest_block = JSON.parse(
            (await this.redis_client.lindex(this.CACHED_KEY, 0))!,
          ) as CacheBlockPtr;

          if (earliest_block.parent_hash === cached_block.ptr.hash) {
            await this.redis_client.lpushx(
              this.CACHED_KEY,
              JSON.stringify(cached_block),
            );
          }
        }

        await this.evict_if_necessary();
      }
    }
  }

  private async missing_parents(
    chain_head_candidate_ptr: string,
    first_block: number,
    max_depth: number,
  ): Promise<string | undefined> {
    const related_blocks = await EthereumBlocks.aggregate([
      {
        $match: {
          block_hash: {
            $eq: chain_head_candidate_ptr,
          },
        },
      },
      {
        $graphLookup: {
          from: "ethereumblocks",
          connectFromField: "parent_hash",
          connectToField: "block_hash",
          as: "chain",
          startWith: "$block_hash",
          maxDepth: max_depth,
          restrictSearchWithMatch: {
            $and: [{ chain_id: this.chain_id }],
          },
        },
      },
      {
        $unwind: "$chain",
      },
      {
        $project: {
          _id: 0,
          chain: 1,
        },
      },
      {
        $group: {
          _id: "$chain._id",
          parent_hash: {
            $first: "$chain.parent_hash",
          },
          block_number: {
            $first: "$chain.block_number",
          },
          block_hash: {
            $first: "$chain.block_hash",
          },
          chain_id: {
            $first: "$chain.chain_id",
          },
          network_name: {
            $first: "$chain.network_name",
          },
        },
      },
      {
        $sort: { block_number: 1 },
      },
    ]);

    if (related_blocks[0].block_number > first_block) {
      return related_blocks[0].parent_hash;
    }

    return;
  }

  private async evict_if_necessary() {
    let cached_length = await this.redis_client.llen(this.CACHED_KEY);
    if (cached_length && cached_length > this.capacity) {
      await this.redis_client.lpop(this.CACHED_KEY);
    }
  }
}
