import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import morgan from "morgan";
import routes from "./routes";
import { RedisConnection } from "./caching/redis";
import { BlockchainIndexer } from "./blockchain-indexer";

const main = async () => {
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

  const blockchain_indexer = new BlockchainIndexer();
  blockchain_indexer.start();

  const app = express();

  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use(morgan("dev"));
  app.use("/", routes);

  const PORT = process.env.SERVER_PORT || 2009;
  app.listen(PORT, () => {
    console.log(`EVM tx indexer listening on port ${PORT}`);
  });
};

main();
