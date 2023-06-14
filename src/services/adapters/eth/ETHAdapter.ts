import { Logger } from "winston";
import { Block } from "@ethersproject/abstract-provider";
import { ChainConfig } from "../../../config/chainConfig";
import { IndexerConfig } from "../../../config/indexer";
import { IContractDeployment } from "../../../models/contract-deployment.model";
import { getIndexerLogger } from "../../../utils/logger";
import { callRPCMethod, callRPCRawMethod } from "../../../utils/rpcRequest";
import { RetryConfig } from "../../retry";

// Codes returned by Ethereum node providers if an eth_getLogs request is too heavy.
// The first one is for Infura when it hits the log limit, the rest for Alchemy timeouts.
const TOO_MANY_LOGS_FINGERPRINTS = [
  "ServerError(-32005)",
  "503 Service Unavailable",
  "ServerError(-32000)",
];

export class ETHAdapter {
  private _block_batch_size: number;
  private _chain_id: number;
  private _logger: Logger;

  constructor(chain_id: number) {
    const indexer_config = IndexerConfig.getInstance();
    this._chain_id = chain_id;
    this._block_batch_size = indexer_config.ETHEREUM_BLOCK_BATCH_SIZE;

    const chainConfig = ChainConfig[this.chain_id as number];

    this._logger = getIndexerLogger(`${chainConfig.name}_${ETHAdapter.name}`);
  }

  public get chain_id(): number {
    return this._chain_id;
  }

  public get logger(): Logger {
    return this._logger;
  }

  public get block_batch_size(): number {
    return this._block_batch_size;
  }

  public async load_blocks_rpc(ids: string[]): Promise<Block[]> {
    const load_block = (id: string) => async () => {
      const block_with_txs = await callRPCRawMethod(
        this.chain_id,
        "eth_getBlockByHash",
        [id, true],
      );

      return block_with_txs;
    };

    let blocks: any[] = [];

    let batches_index = 0;
    let batch_retries: Promise<any>[][] = [[]];
    for (let id of ids) {
      if (!batch_retries[batches_index]) batch_retries[batches_index] = [];
      batch_retries[batches_index].push(
        await new RetryConfig(
          `load block ${id}`,
          this.logger,
          TOO_MANY_LOGS_FINGERPRINTS,
        ).run(load_block(id)()),
      );

      if (
        ((batches_index + 1) * this.block_batch_size) /
          batch_retries[batches_index].length ==
        1
      ) {
        batches_index++;
      }
    }

    for (let batch of batch_retries) {
      let result = await Promise.all(batch);
      blocks.push(...result);
    }

    return blocks;
  }

  public async get_block_hash_by_block_number(block_number: number) {
    try {
      let retry = new RetryConfig(
        `eth_getBlockByNumber RPC call for block number ${block_number}`,
        this.logger,
        TOO_MANY_LOGS_FINGERPRINTS,
      );

      const get_block_hash = (block_number: number) => async () => {
        let result = await callRPCMethod(this.chain_id, "getBlock", [
          block_number,
        ]);

        return result;
      };

      const result = await retry.run(get_block_hash(block_number)());
      return result.hash;
    } catch (err: any) {
      this.logger.warn(
        `Ethereum node took too long to return data for block #${block_number}`,
      );
      throw err;
    }
  }

  public async get_block_by_hash(block_hash: string): Promise<Block> {
    try {
      let retry = new RetryConfig(
        `eth_getBlockByHash RPC call for block number ${block_hash}`,
        this.logger,
        TOO_MANY_LOGS_FINGERPRINTS,
      );

      const get_block_hash = (block_hash: string) => async () => {
        let result = await callRPCRawMethod(
          this.chain_id,
          "eth_getBlockByHash",
          [block_hash, true],
        );

        return result;
      };

      const result = await retry.run(get_block_hash(block_hash)());
      return result;
    } catch (err: any) {
      this.logger.warn(
        `Ethereum node took too long to return data for block #${block_hash}`,
      );
      throw err;
    }
  }
}
