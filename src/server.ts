import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import morgan from "morgan";
import routes from "./routes";
import { RedisConnection } from "./caching/redis";
import { BlockchainIndexer } from "./blockchain-indexer";
import { getIndexerLogger } from "./utils/logger";

const main = async () => {
  let redis_client = await RedisConnection.getClient();

  try {
    const res = await redis_client.ping();
    console.log("Redis ping response: ", res);
    console.log("Connected to Redis!");
  } catch (err: any) {
    throw new Error(err.message);
  }

  if (process.env.MONGODB_CONNECTION_STRING) {
    await mongoose.connect(process.env.MONGODB_CONNECTION_STRING);
    console.log("Connected to MongoDB!");
  }

  const blockchain_indexer = new BlockchainIndexer();
  blockchain_indexer.start();

  const app = express();
  const logger = getIndexerLogger("Application-API");

  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use(
    morgan("combined", {
      stream: { write: (message) => logger.info(message) },
    }),
  );
  app.use("/", routes);

  const PORT = process.env.SERVER_PORT || 2009;
  app.listen(PORT, () => {
    console.log(`EVM tx indexer listening on port ${PORT}`);
  });
};

main();
