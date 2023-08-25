require("ts-node").register({ transpileOnly: true });

import axios from "axios";

import { getRPCProvider, setProviderIndex } from "../config/chainConfig";
import { TOO_MANY_LOGS_FINGERPRINTS } from "../services/errors";
import { RedisConnection } from "../caching/redis";
import { IndexerConfig } from "../config/indexer";
import { Logger } from "winston";

/***
 * Wraps any callable with a retry mechanism, primarily used for fault tolerance
 * against failing RPCs
 *
 * @param {function} callable
 * @param logger
 * @param chainName
 * @return {Promise<*>}
 */
export async function callRPCMethod({
  chainId,
  callable,
  params,
  logger,
}: {
  chainId: number;
  callable: string;
  params?: any;
  logger?: Logger;
}): Promise<any> {
  let redis_client = RedisConnection.getClient();
  let indexer_config = IndexerConfig.getInstance();

  let provider = getRPCProvider(chainId);
  let res = null;
  const failed_time = await redis_client.get(
    `${chainId}_${callable}_failed_counter`,
  );

  try {
    log(
      logger,
      `Current chosen network provider url: ${provider.connection.url}`,
    );

    res = await (params ? provider[callable](...params) : provider[callable]());
    await redis_client.del(`${chainId}_${callable}_failed_counter`);
    return res;
  } catch (err: any) {
    log(logger, `Error RPC request: ${err.message}`);
    const updated_failed_time = failed_time ? Number(failed_time) + 1 : 0;
    console.log("updated_failed_time: ", updated_failed_time);
    await redis_client.set(
      `${chainId}_${callable}_failed_counter`,
      updated_failed_time,
    );

    if (
      updated_failed_time >
      indexer_config.MAXIMUM_RPC_REQUEST_FAILED_TOLERANT_TIMES
    ) {
      const new_rpc_url = setProviderIndex(chainId);
      const message = `Set network ${chainId} current RPC url to: ${new_rpc_url.connection.url}`;
      log(logger, message);
      await redis_client.del(`${chainId}_${callable}_failed_counter`);
    }

    throw err;
  }
}

export async function callRPCRawMethod({
  chainId,
  method,
  params,
  logger,
}: {
  chainId: number;
  method: string;
  params?: any[];
  logger?: Logger;
}): Promise<any> {
  let provider = await getRPCProvider(chainId);
  let redis_client = RedisConnection.getClient();
  let indexer_config = IndexerConfig.getInstance();

  const failed_time = await redis_client.get(
    `raw_${chainId}_${method}_failed_counter`,
  );

  log(
    logger,
    `Current chosen network provider url: ${provider.connection.url}`,
  );

  const instance = axios.create({
    baseURL: provider.connection.url,
    headers: {
      "Content-Type": "application/json",
    },
    timeout: 10000,
  });
  let res = null;
  try {
    let response = await instance.post(
      "/",
      JSON.stringify({
        method,
        params,
        id: 1,
        jsonrpc: "2.0",
      }),
      {
        headers: {
          // Overwrite Axios's automatically set Content-Type
          "Content-Type": "application/json",
        },
      },
    );

    await redis_client.del(`raw_${chainId}_${method}_failed_counter`);

    res = response.data.result;
    return res;
  } catch (err: any) {
    log(logger, `Error Raw RPC request: ${err.message}`);
    const updated_failed_time = failed_time ? Number(failed_time) + 1 : 0;
    await redis_client.set(
      `raw_${chainId}_${method}_failed_counter`,
      updated_failed_time,
    );

    const matched = TOO_MANY_LOGS_FINGERPRINTS.some((error) =>
      err.message.includes(error),
    );
    if (
      matched &&
      updated_failed_time >
        indexer_config.MAXIMUM_RPC_REQUEST_FAILED_TOLERANT_TIMES
    ) {
      const new_rpc_url = setProviderIndex(chainId);
      const message = `Set network ${chainId} current RPC url to: ${new_rpc_url.connection.url}`;
      log(logger, message);
      await redis_client.del(`raw_${chainId}_${method}_failed_counter`);
    }

    throw err;
  }
}

const log = (logger: Logger | undefined, msg: string) => {
  if (logger) {
    logger.info(msg);
    return;
  }

  console.log(msg);
};
