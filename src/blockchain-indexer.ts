import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
// import { indexBackward } from './services/indexBackward';
// import { indexOlderTransactions } from './services/indexOlderTransactions';
import { RedisConnection } from "./caching/redis";
import {
  get_all_deployments,
  save_contract_deployments,
} from "./services/store/contract_deployment_store";
import { EthereumIndexForward } from "./services/indexers";
import { ChainStore } from "./services/store/chain_head_store";
import { BlockIngestor } from "./services/block_ingestors/eth";
import { Redis } from "ioredis";

export class BlockchainIndexer {
  public async start() {
    try {
      await save_contract_deployments();

      const chain_store = new ChainStore(97);
      const block_ingestor = new BlockIngestor(97, chain_store);

      block_ingestor.start();

      let deployments = await get_all_deployments();
      // console.log("ALL DEPLOYMENTS: ", deployments);
      for (let deployment of deployments) {
        const indexer = new EthereumIndexForward(deployment, chain_store);
        indexer.start();
      }
    } catch (err) {
      console.log("Catching an error: ", err);
    }
  }
}
