// require("ts-node").register({});

import dotenv from "dotenv";
dotenv.config();

import {
  get_all_deployments,
  save_contract_deployments,
} from "./services/store/contract_deployment_store";
import { EthereumIndexForward } from "./services/indexers";
import { ChainStore } from "./services/store/chain_head_store";
import { BlockIngestor } from "./services/block_ingestors/eth";
// import { Worker, isMainThrea/d, parentPort } from "worker_threads";

export class BlockchainIndexer {
  public async start() {
    try {
      // if (isMainThread) {
      await save_contract_deployments();

      const chain_store = new ChainStore(97);

      let deployments = await get_all_deployments();
      // console.log("ALL DEPLOYMENTS: ", deployments);

      const block_ingestor = new BlockIngestor(97, chain_store);
      block_ingestor.start();

      for (let deployment of deployments) {
        const indexer = new EthereumIndexForward(deployment, chain_store);
        indexer.start();
      }

      // worker.on("message", (msg) => {
      //   console.log(msg);
      // });
      // worker.postMessage("123"); // block_ingestor is serialized
      // } else {
      // }
    } catch (err) {
      console.log("Catching an error: ", err);
    }
  }
}
