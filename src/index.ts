import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
// import { indexBackward } from './services/indexBackward';
// import { indexOlderTransactions } from './services/indexOlderTransactions';
import { IndexForward } from "./services/indexers/eth";
import { RedisConnection } from "./db/redis";
import { ChainConfig } from "./config/chainConfig";
import {
  get_all_deployments,
  save_contract_deployments,
} from "./services/store/contract_deployment_store";
import { EthereumIndexForward } from "./services/indexers";
import { ChainStore } from "./services/store/chain_head_store";

const main = async () => {
  try {
    let redis_client = await RedisConnection.getClient({
      password: process.env.REDIS_PASSWORD,
    });

    try {
      await redis_client.ping(() => {
        console.log("Connected to Redis!");
      });
    } catch (err: any) {
      throw new Error(err.message);
    }

    if (process.env.MONGODB_CONNECTION_STRING) {
      await mongoose.connect(process.env.MONGODB_CONNECTION_STRING);
      console.log("Connected to MongoDB!");
    }

    // Loading the rest config
    const INDEX_INTERVAL = Number(process.env.INDEX_INTERVAL) || 15000; // default will be 15 seconds

    // Schedule indexing for all chains insidig
    // for (let [_, config] of Object.entries(ChainConfig)) {
    // Reset indexing status
    // await redis_client.set(`${config.name}_IS_INDEXING_FORWARD`, 'false');
    // await redis_client.set(`${config.name}_IS_INDEXING_BACKWARD`, 'false');

    await save_contract_deployments();

    const chain_store = new ChainStore(97);
    chain_store.start();

    let deployments = await get_all_deployments();
    for (let deployment of deployments) {
      const indexer = new EthereumIndexForward(deployment, chain_store);
      indexer.start();
    }

    // setInterval(() => {
    //   indexBackward(config);
    // }, INDEX_INTERVAL);

    // // Index older transactions
    // if (config.oldestBlock) {
    //   indexOlderTransactions(config).then(() =>
    //     console.log(`Finished backindexing ${config.name}`),
    //   );
    // }
    // }
  } catch (err) {
    console.log("Catching an error: ", err);
  }
};

main();
