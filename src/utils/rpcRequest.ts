import { Logger } from "winston";
import { getRPCProvider } from "../config/chainConfig";
import axios from "axios";

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
): Promise<any> {
  let provider = getRPCProvider(chainId);
  let res = null;
  try {
    res = await (params ? provider[callable](...params) : provider[callable]());
  } catch (err: any) {
    console.log(err.message);
    throw err;
  }
  return res;
}

export async function callRPCRawMethod(
  chainId: number,
  method?: string,
  params?: any[],
): Promise<any> {
  let provider = getRPCProvider(chainId);
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

    res = response.data.result;
  } catch (err: any) {
    throw err;
  }
  return res;
}
