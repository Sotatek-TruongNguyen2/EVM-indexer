import { Logger } from "winston";
import { ETHAdapter } from "../../adapters";
import { IndexerConfig } from "../../../config/indexer";
import { getIndexerLogger } from "../../../utils/logger";
import { ChainConfig } from "../../../config/chainConfig";
// import { callRPCMethod } from "../../../utils/rpcRequest";
import { ChainStore } from "../../store/chain_head_store";
import { LogCode } from "../../store/types";
// import Piscina from "piscina";
import { callRPCMethod } from "../../../utils/rpcRequest";

export class BlockIngestor {
  private _logger: Logger;
  private _chain_id: number;
  private _ancestor_count: number;
  private _polling_interval: number;
  private _adapter: ETHAdapter;
  private _chain_store: ChainStore;
  // private _pool: Piscina;

  constructor(chain_id: number, chain_store: ChainStore) {
    const indexer_config = IndexerConfig.getInstance();

    this._chain_store = chain_store;
    // this._pool = pool;
    this._adapter = new ETHAdapter(chain_id, this.chain_store);
    this._polling_interval = indexer_config.INGESTOR_POLLING_INTERVAL;
    this._ancestor_count = indexer_config.REORG_THRESHOLD;
    this._chain_id = chain_id;
    const chainConfig = ChainConfig[chain_id as number];
    if (chainConfig) {
      this._logger = getIndexerLogger(`${chainConfig.name}_chain_head_ptr`);
    }
  }

  // public get pool(): Piscina {
  //   return this._pool;
  // }

  public get chain_store(): ChainStore {
    return this._chain_store;
  }

  public get adapter(): ETHAdapter {
    return this._adapter;
  }

  public get polling_interval(): number {
    return this._polling_interval;
  }

  public get ancestor_count(): number {
    return this._ancestor_count;
  }

  public get chain_id(): number {
    return this._chain_id;
  }

  public get logger(): Logger {
    return this._logger;
  }

  private async ingest_block(block_hash: string) {
    try {
      let block = await this.adapter.get_block_by_hash_with_logs(block_hash);
      await this.chain_store.upsert_block(block);
      return await this.chain_store.attempt_chain_head_update();
    } catch (err: any) {
      this.logger.debug(err.message);
    }
  }

  private async do_ingest_block() {
    // const pool = new Piscina({
    //   filename: path.resolve(__dirname, "../", "../", `./utils/rpcRequest.ts`),
    //   // In dev or test, we register ts-node using nodejs arguments
    //   execArgv: isDevOrTest ? ["-r", "ts-node/register"] : undefined,
    //   maxThreads: 4,
    //   minThreads: 2,
    //   taskQueue: new PiscinaPriorityQueue(),
    // });
    try {
      let latest_block = await callRPCMethod({
        chainId: this.chain_id,
        callable: "getBlock",
        params: ["latest"],
        // logger: this.logger,
      });

      // let latest_block = await this.pool.run(
      //   {
      //     chainId: this.chain_id,
      //     callable: "getBlock",
      //     params: ["latest"],
      //     // logger: this.logger,
      //   },
      //   {
      //     name: "callRPCMethod",
      //   },
      // );

      // console.log("latest block:", latest_block);

      let chain_head_ptr = await this.chain_store.chain_head_ptr();
      // console.log("chain_head_ptr: ", chain_head_ptr);

      if (chain_head_ptr) {
        if (chain_head_ptr.number == latest_block.number) {
          return;
        }

        if (chain_head_ptr.number > latest_block.number) {
          this.logger.warn(
            `Provider went backwards - ignoring this latest block. current_block_head: ${chain_head_ptr.number}, latest_block_head: ${latest_block.number}`,
          );
          return;
        }
      }

      if (!chain_head_ptr) {
        this.logger.info(
          "Downloading latest blocks from Ethereum, this may take a few minutes...",
        );
      } else {
        let latest_number = latest_block.number;
        let head_ptr_number = chain_head_ptr.number;
        let distance = latest_number - head_ptr_number;
        let blocks_needed = Math.min(distance, this.ancestor_count);

        let code = LogCode.BlockIngestionStatus;

        if (blocks_needed > 15) {
          code = LogCode.BlockIngestionLagging;
        }

        if (distance > 0) {
          this.logger.info(
            `Syncing ${blocks_needed} blocks from Ethereum. current_block_head: ${head_ptr_number}, latest_block_head: ${latest_number}, blocks_behind: ${distance}, blocks_needed: ${blocks_needed}, code: ${
              code === LogCode.BlockIngestionLagging ? "Lagging" : "Status"
            }`,
          );
        }
      }

      // Store latest block in block store.
      // Might be a no-op if latest block is one that we have seen.
      // ingest_blocks will return a (potentially incomplete) list of blocks that are
      //   missing.
      let missing_parent = await this.ingest_block(latest_block.hash);
      while (missing_parent) {
        missing_parent = await this.ingest_block(missing_parent);
      }
    } catch (err: any) {
      console.log(err.message);
    }
  }

  private async do_poll() {
    await this.do_ingest_block();

    setTimeout(() => {
      this.do_poll();
    }, this.polling_interval);
  }

  public start() {
    this.do_poll();
  }
}

// export async function build_block_ingestor({
//   chain_id,
//   chain_store,
// }: // pool,
// {
//   chain_id: number;
//   chain_store: ChainStore;
//   // pool: Piscina;
// }) {
//   // const block_ingestor = new BlockIngestor(chain_id, chain_store);
//   // block_ingestor.start();
// }
