import {
  get_all_deployments,
  save_contract_deployments,
} from "./services/store/contract_deployment_store";
import { EthereumIndexForward } from "./services/indexers";
import { ChainStore } from "./services/store/chain_head_store";
import { BlockIngestor } from "./services/block_ingestors/eth";
// import Piscina from "piscina";
import path from "path";
// import PiscinaPriorityQueue from "piscina-priority-queue";

export class BlockchainIndexer {
  public async start() {
    try {
      // if (isMainThread) {
      await save_contract_deployments();

      const chain_store = new ChainStore(97);

      let deployments = await get_all_deployments();

      const block_ingestor = new BlockIngestor(97, chain_store);
      block_ingestor.start();

      for (let deployment of deployments) {
        const indexer = new EthereumIndexForward(deployment, chain_store);
        indexer.start();
      }
    } catch (err) {
      console.log("Catching an error: ", err);
    }
  }
}
