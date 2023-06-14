import { Logger } from 'winston';
import { buildTokenContract, getRPCProvider } from '../config/chainConfig';
import { RedisConnection } from '../db/redis';
import { ChainConfig } from '../types';

type EventSigs = {
  address: string;
  topics: string[];
  abi: any;
};

export const getEventByFilters = async (
  chainConfig: ChainConfig,
  eventSig: EventSigs,
  from: number,
  to: number,
  logger?: Logger,
): Promise<any> => {
  let redisClient = await RedisConnection.getClient();

  // Get the current RPC url index
  let cachedRpcIndex = await redisClient.get(`${chainConfig.name}_RPC_INDEX`);

  let rpcIndex = cachedRpcIndex ? Number(cachedRpcIndex) : 0; // 0 as default
  let provider = getRPCProvider(chainConfig.id, rpcIndex);

  let retryCnt = 0;
  let maxReties = 5;

  let contract = buildTokenContract(eventSig.address, eventSig.abi, provider);
  let res;

  while (!res) {
    try {
      res = await contract.queryFilter(
        {
          address: eventSig.address,
          topics: eventSig.topics,
        },
        from,
        to,
      );
    } catch (err) {
      logger?.warn(
        `RPC requests failed due to maximum requests or overload! Re-try time ${retryCnt}`,
      );
      retryCnt++;
      await new Promise((r) => setTimeout(r, 3000));

      if (retryCnt > maxReties) {
        logger?.warn(
          'RPC requests failed due to maximum requests or overload! Try-replace',
        );

        rpcIndex = rpcIndex + 1;
        if (rpcIndex >= chainConfig.rpcUrls.length) {
          rpcIndex = 0;
        }

        redisClient.set(`${chainConfig.name}_RPC_INDEX`, rpcIndex);

        logger?.warn(
          `Change ${chainConfig.name} RPC URL: ${chainConfig.rpcUrls[rpcIndex]}`,
        );

        continue;
      }
    }
  }

  return res;
};
