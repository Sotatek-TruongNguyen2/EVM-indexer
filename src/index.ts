import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { indexBackward } from './services/indexBackward';
import { indexForward } from './services/indexForward';
import { indexOlderTransactions } from './services/indexOlderTransactions';
import { RedisConnection } from './db/redis';
import { ChainConfig } from './config/chainConfig';

const main = async () => {
  try {
    let redisClient = await RedisConnection.getClient({
      password: process.env.REDIS_PASSWORD,
    });

    try {
      await redisClient.ping(() => {
        console.log('Connected to Redis!');
      });
    } catch (err: any) {
      throw new Error(err.message);
    }

    if (process.env.MONGODB_CONNECTION_STRING) {
      await mongoose
        .connect(process.env.MONGODB_CONNECTION_STRING)
        .catch((err) => {
          throw new Error(err.message);
        });
      console.log('Connected to MongoDB!');
    }

    // Loading the rest config
    const INDEX_INTERVAL = Number(process.env.INDEX_INTERVAL) || 15000; // default will be 15 seconds

    // Schedule indexing for all chains insidig
    for (let [k, config] of Object.entries(ChainConfig)) {
      // Reset indexing status
      await redisClient.set(`${config.name}_IS_INDEXING_FORWARD`, 'false');
      await redisClient.set(`${config.name}_IS_INDEXING_BACKWARD`, 'false');

      setInterval(() => {
        indexForward(config);
      }, INDEX_INTERVAL);
      setInterval(() => {
        indexBackward(config);
      }, INDEX_INTERVAL);

      // Index older transactions
      if (config.oldestBlock) {
        indexOlderTransactions(config).then(() =>
          console.log(`Finished backindexing ${config.name}`),
        );
      }
    }
  } catch (err) {
    console.log('Catching an error: ', err);
  }
};

main();
