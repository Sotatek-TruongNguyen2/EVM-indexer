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
export async function callRPCMethod(
  chainId: number,
  callable: string,
  params?: any,
  logger?: Logger,
): Promise<any> {
  let redis_client = RedisConnection.getClient();
  let indexer_config = IndexerConfig.getInstance();
  // while (true) {
  let provider = getRPCProvider(chainId);
  let res = null;
  const failed_time = await redis_client.get(
    `${chainId}_${callable}_failed_counter`,
  );

  try {
    res = await (params ? provider[callable](...params) : provider[callable]());
    await redis_client.del(`${chainId}_${callable}_failed_counter`);
    return res;
  } catch (err: any) {
    console.log("ERROR: ", err.message);
    const updated_failed_time = failed_time ? Number(failed_time) + 1 : 0;
    console.log("updated_failed_time: ", updated_failed_time);
    await redis_client.set(
      `${chainId}_${callable}_failed_counter`,
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
      logger &&
        logger.info(
          `Set network ${chainId} current RPC url to: ${new_rpc_url.connection.url}`,
        );
      await redis_client.del(`${chainId}_${callable}_failed_counter`);
    }

    throw err;
  }
}

export async function callRPCRawMethod(
  chainId: number,
  method: string,
  params?: any[],
  logger?: Logger,
): Promise<any> {
  let provider = await getRPCProvider(chainId);
  let redis_client = RedisConnection.getClient();
  let indexer_config = IndexerConfig.getInstance();

  const failed_time = await redis_client.get(
    `raw_${chainId}_${method}_failed_counter`,
  );

  console.log(`raw_${chainId}_${method}_failed_counter`, failed_time);

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
    console.log("ERROR: ", err.message);
    const updated_failed_time = failed_time ? Number(failed_time) + 1 : 0;
    console.log("WE HERE: ", updated_failed_time);
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
      logger &&
        logger.info(
          `Set network ${chainId} current RPC url to: ${new_rpc_url.connection.url}`,
        );
      await redis_client.del(`raw_${chainId}_${method}_failed_counter`);
    }

    throw err;
  }
}
