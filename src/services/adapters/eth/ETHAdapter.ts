import { Logger } from "winston";
import {
  Block,
  BlockWithTransactions,
  TransactionReceipt,
  Log,
} from "@ethersproject/abstract-provider";
// import Piscina from "piscina";
// import path from "path";
// import spq from "shuffled-priority-queue";

import { ChainConfig } from "../../../config/chainConfig";
import { IndexerConfig } from "../../../config/indexer";
import { getIndexerLogger } from "../../../utils/logger";
// import { callRPCMethod, callRPCRawMethod } from "../../../utils/rpcRequest";
import { RetryConfig } from "../../retry";
import {
  EthereumBlocks,
  IEthereumBlock,
} from "../../../models/ethereum-block.model";
import { BlockPtr, BlockWithLogs } from "../../../types";
import { ChainStore } from "../../store/chain_head_store";
import { TOO_MANY_LOGS_FINGERPRINTS } from "../../errors";
import { callRPCMethod, callRPCRawMethod } from "../../../utils/rpcRequest";
import { Transaction } from "@ethersproject/transactions";

export class ETHAdapter {
  private _block_batch_size: number;
  private _chain_id: number;
  private _logger: Logger;
  private _chain_store: ChainStore;
  // private _pool: Piscina;

  constructor(chain_id: number, chain_store: ChainStore) {
    const indexer_config = IndexerConfig.getInstance();
    this._chain_id = chain_id;
    this._block_batch_size = indexer_config.ETHEREUM_BLOCK_BATCH_SIZE;
    this._chain_store = chain_store;
    const chainConfig = ChainConfig[this.chain_id as number];

    this._logger = getIndexerLogger(`${chainConfig.name}_${ETHAdapter.name}`);
    // this._pool = pool;
  }

  // public get pool(): Piscina {
  //   return this._pool;
  // }

  public get chain_id(): number {
    return this._chain_id;
  }

  public get logger(): Logger {
    return this._logger;
  }

  public get chain_store(): ChainStore {
    return this._chain_store;
  }

  public get block_batch_size(): number {
    return this._block_batch_size;
  }

  public async ancestor_block(
    block_ptr: BlockPtr,
    offset: number,
  ): Promise<IEthereumBlock | undefined> {
    return await this.chain_store.ancestor_block(block_ptr, offset);
  }

  public async load_blocks(
    ids: string[],
    chain_store: ChainStore,
  ): Promise<IEthereumBlock[]> {
    let blocks_in_db = (await EthereumBlocks.find({
      block_hash: {
        $in: ids,
      },
    })) as IEthereumBlock[];

    let missing_blocks_hash = ids.filter(
      (id) => !blocks_in_db.some((block) => block.block_hash === id),
    );

    this.logger.info(`Requesting ${missing_blocks_hash.length} block(s)`);

    const missing_blocks = await this.load_blocks_rpc(missing_blocks_hash);

    for (let block of missing_blocks) {
      try {
        const block_with_logs = await chain_store.upsert_light_block(block);
        blocks_in_db.push(block_with_logs);
      } catch (err: any) {
        this.logger.warn(`Error writing to block cache ${err.message}`);
      }
    }

    return blocks_in_db;
  }

  public async load_blocks_rpc(ids: string[]): Promise<BlockWithLogs[]> {
    const load_block = (id: string) => async () => {
      const block_with_logs = await this.get_block_by_hash_with_logs(id);
      return block_with_logs;
    };

    const run_retry_with_block = (id: string, logger: Logger) => {
      return async function () {
        return new RetryConfig(
          `load block ${id}`,
          logger,
          TOO_MANY_LOGS_FINGERPRINTS,
        ).run(load_block(id)());
      };
    };

    let blocks: BlockWithLogs[] = [];

    let batches_index = 0;
    let block_fetch_batch_retries: (() => Promise<void>)[][] = [];
    for (let id of ids) {
      if (!block_fetch_batch_retries[batches_index])
        block_fetch_batch_retries[batches_index] = [];
      block_fetch_batch_retries[batches_index].push(
        run_retry_with_block(id, this.logger),
      );

      if (
        ((batches_index + 1) * this.block_batch_size) /
          Object.keys(block_fetch_batch_retries[batches_index]).length ==
        1
      ) {
        batches_index++;
      }
    }

    for (let block_fetch_batch of block_fetch_batch_retries) {
      let result = await Promise.allSettled(
        block_fetch_batch.map((block_fetch) => block_fetch()),
      );

      result.forEach((block_fetch_result) => {
        if (block_fetch_result.status === "fulfilled") {
          blocks.push(block_fetch_result.value as any);
        }
      });
    }

    return blocks;
  }

  public async get_transaction_receipts_for_transaction_hashes(
    transaction_hashes_by_block: Map<string, Set<string>>,
  ): Promise<Map<string, TransactionReceipt>> {
    let receipts_by_hash = new Map<string, TransactionReceipt>();

    if (transaction_hashes_by_block.size === 0) {
      return receipts_by_hash;
    }

    for (const [
      block_hash,
      transaction_hashes,
    ] of transaction_hashes_by_block.entries()) {
      for (let transaction_hash of Array.from(transaction_hashes)) {
        const transaction_receipt =
          await this.fetch_transaction_receipt_by_hash(transaction_hash);

        receipts_by_hash.set(transaction_hash, transaction_receipt);
      }
    }

    return receipts_by_hash;
  }

  public async get_block_hash_by_block_number(
    block_number: number,
  ): Promise<string> {
    try {
      let retry = new RetryConfig(
        `eth_getBlockByNumber RPC call for block number ${block_number}`,
        this.logger,
        TOO_MANY_LOGS_FINGERPRINTS,
      );

      const get_block_hash = (block_number: number) => async () => {
        let result = await callRPCMethod({
          chainId: this.chain_id,
          callable: "getBlock",
          params: [block_number],
          // logger: this.logger,
        });

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

  public async fetch_transaction_receipt_by_hash(
    tx_hash: string,
  ): Promise<TransactionReceipt> {
    try {
      let retry = new RetryConfig(
        `eth_getTransactionReceipt RPC call for transaction hash ${tx_hash}`,
        this.logger,
        TOO_MANY_LOGS_FINGERPRINTS,
      );

      const get_transaction_receipt_by_hash = (tx_hash: string) => async () => {
        let result = await callRPCRawMethod({
          chainId: this.chain_id,
          method: "eth_getTransactionReceipt",
          params: [tx_hash],
          logger: this.logger,
        });

        return result;
      };

      const result = await retry.run(
        get_transaction_receipt_by_hash(tx_hash)(),
      );
      return result;
    } catch (err: any) {
      this.logger.warn(
        `Ethereum node took too long to find the receipt for transaction hash ${tx_hash}`,
      );
      throw err;
    }
  }

  public async get_block_by_hash(block_hash: string): Promise<Block> {
    try {
      let retry = new RetryConfig(
        `eth_getBlockByHash RPC call for block hash ${block_hash}`,
        this.logger,
        TOO_MANY_LOGS_FINGERPRINTS,
      );

      const get_block_hash = (block_hash: string) => async () => {
        let result = await callRPCRawMethod({
          chainId: this.chain_id,
          method: "eth_getBlockByHash",
          params: [block_hash, true],
          logger: this.logger,
        });

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

  public async get_block_by_hash_with_logs(
    block_hash: string,
  ): Promise<BlockWithLogs> {
    try {
      let retry = new RetryConfig(
        `eth_getBlockByHash RPC call for block number ${block_hash}`,
        this.logger,
        TOO_MANY_LOGS_FINGERPRINTS,
      );

      const get_block_hash_with_logs = (block_hash: string) => async () => {
        let result = (await callRPCRawMethod({
          chainId: this.chain_id,
          method: "eth_getBlockByHash",
          params: [block_hash, false],
          // logger: this.logger,
        })) as Block;

        if (!result || !result.number) {
          throw new Error(
            `Ethereum data for block hash ${block_hash} not found. Result: ${result}`,
          );
        }

        let logs = (await callRPCRawMethod({
          chainId: this.chain_id,
          method: "eth_getLogs",
          params: [
            {
              fromBlock: result.number,
              toBlock: result.number,
            },
          ],
          logger: this.logger,
        })) as Log[];

        return {
          hash: result.hash,
          gasUsed: result.gasUsed,
          gasLimit: result.gasLimit,
          number: result.number,
          timestamp: result.timestamp,
          parentHash: result.parentHash,
          logs,
        };
      };

      const result = await retry.run(get_block_hash_with_logs(block_hash)());
      return result;
    } catch (err: any) {
      this.logger.warn(
        `Ethereum node took too long to return block data with its logs for block #${block_hash}`,
      );
      throw err;
    }
  }

  public async is_on_main_chain(block_ptr: BlockPtr) {
    const block_hash = await this.get_block_hash_by_block_number(
      block_ptr.number,
    );
    return block_hash === block_ptr.hash;
  }

  public async get_ancestor_block() {}
}
