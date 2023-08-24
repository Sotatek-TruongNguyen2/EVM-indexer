import cron from "node-cron";
import { Logger } from "winston";
import PubSub from "pubsub-js";
import { ChainConfig } from "../../config/chainConfig";
import { getIndexerLogger } from "../../utils/logger";
import { ChainStore } from "../store/chain_head_store";
import {
  clean_logs_for_block_range,
  instantiate_block_cleaner,
  retrieve_block_cleaner,
  update_latest_cleaned_block,
} from "../store/block_cleaner";
import { Topics } from "../pubsub/topics";
import { IndexerConfig } from "../../config/indexer";

export class EthereumBlockCleaner {
  private _logger: Logger;
  private _chain_id: number;
  private _maximum_clean_blocks_once: number;
  private _minimum_clean_blocks_once: number;
  private _chain_store: ChainStore;
  private _chain_head_emitter: any;

  constructor(
    chain_id: number,
    chain_store: ChainStore,
    maximum_clean_blocks_once: number,
    minimum_clean_blocks_once: number,
  ) {
    this._chain_id = chain_id;
    this._chain_store = chain_store;
    this._maximum_clean_blocks_once = maximum_clean_blocks_once;
    this._minimum_clean_blocks_once = minimum_clean_blocks_once;

    if (this._chain_store.chain_id !== this._chain_id) {
      throw new Error("Invalid ChainStore due to mismatch ChainID !");
    }

    const chainConfig = ChainConfig[chain_id as number];
    if (chainConfig) {
      this._logger = getIndexerLogger(`${chainConfig.name}_block_cleaner`);
    }
  }

  public get chain_head_emitter(): any {
    return this._chain_head_emitter;
  }

  public get chain_store(): ChainStore {
    return this._chain_store;
  }

  public get chain_id(): number {
    return this._chain_id;
  }

  public get logger(): Logger {
    return this._logger;
  }

  public get maximum_clean_blocks_once(): number {
    return this._maximum_clean_blocks_once;
  }

  public get minimum_clean_blocks_once(): number {
    return this._minimum_clean_blocks_once;
  }

  public async start() {
    this._chain_head_emitter = PubSub.subscribe(
      Topics.CHAIN_HEAD_STORE_UPDATE,
      async (msg, data) => {
        if (msg === Topics.CHAIN_HEAD_STORE_UPDATE && data) {
          PubSub.unsubscribe(this._chain_head_emitter);
          this._chain_head_emitter = null;

          const chain_head_ptr = await this.chain_store.chain_head_ptr();
          await instantiate_block_cleaner(this.chain_id, chain_head_ptr);

          this.start_clean();
        }
      },
    );
  }

  private async start_clean() {
    const indexer_config = IndexerConfig.getInstance();

    // The Cron Job runs every 1 minutes to clean old logs to free disk space
    cron.schedule("*/1 * * * *", async () => {
      this.logger.debug(`Try to running job to clean the old logs`);

      const chain_head_ptr = await this.chain_store.chain_head_ptr();
      const block_cleaner = await retrieve_block_cleaner(this.chain_id)!;

      if (!chain_head_ptr) {
        this.logger.debug(
          `Chain Head Pointer doesn't exist yet! Maybe due to initialization. Wait a minutes ...`,
        );
        return;
      }

      if (!block_cleaner || !block_cleaner.latest_clean_block_number) {
        this.logger.debug(
          `Latest_clean_block_number doesn't exist yet! Maybe due to initialization. Wait a minutes ...`,
        );
        return;
      }

      if (chain_head_ptr.number < block_cleaner.latest_clean_block_number) {
        await update_latest_cleaned_block(
          this.chain_id,
          chain_head_ptr.number,
          this.logger,
        );
        return;
      }

      // Determine the best distance
      let latest_valid_block =
        chain_head_ptr.number - indexer_config.REORG_THRESHOLD;

      let distance =
        latest_valid_block > block_cleaner.latest_clean_block_number
          ? latest_valid_block - block_cleaner.latest_clean_block_number + 1
          : 0;

      if (distance > this.maximum_clean_blocks_once) {
        distance = this.maximum_clean_blocks_once;
      }

      if (distance < this.minimum_clean_blocks_once) {
        distance = 0;
      }

      await clean_logs_for_block_range(this.chain_id, distance, this.logger);
    });
  }
}
