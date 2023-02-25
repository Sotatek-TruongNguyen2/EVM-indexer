import { ethers } from 'ethers';
import { RedisConnection } from '../db/redis';
import { ChainConfig } from '../types';
import {
  buildTokenContract,
  getMasterChefAbi,
  getRPCProvider,
} from '../config/chainConfig';
// import {getTopicsHash} from "../config/topics.js";
import { processEvents } from './processEvents';
import { getIndexerLogger } from '../utils/logger';
import { getEpochSeconds } from '../utils/epoch';
import { getTopicsHash } from '../config/topic';
// import {buildBridgeContract, getBridgeContractAbi, getW3Provider} from "../config/chainConfig.js";

export async function indexOlderTransactions(chainConfig: ChainConfig) {
  if (chainConfig.oldestBlock) {
    let logger = getIndexerLogger(
      `${chainConfig.name}_${indexOlderTransactions.name}`,
    );
    let chainName = chainConfig.name;
    let redisClient = await RedisConnection.getClient();

    try {
      let provider = getRPCProvider(chainConfig.id);

      // // Initialize Bridge Contract
      let stakingContractAddress = ethers.utils.getAddress(
        chainConfig.contract,
      );
      let stakingContract = buildTokenContract(
        stakingContractAddress,
        getMasterChefAbi(),
        provider,
      );

      // Get the block you wish to index until
      let cachedStartBlock = await redisClient.get(
        `${chainName}_NEWEST_BACKINDEXED_BLOCK`,
      );
      let startBlock = cachedStartBlock
        ? parseInt(cachedStartBlock)
        : chainConfig.oldestBlock;
      let endBlock = chainConfig.startBlock;

      for (let b = startBlock; b <= endBlock; b += 500) {
        logger.debug(`start indexing back to front from: ${b} to ${b + 500}`);
        // Get events between these blocks
        let filteredEvents = await stakingContract.queryFilter(
          {
            address: stakingContractAddress,
            topics: getTopicsHash(),
          },
          b,
          b + 500,
        );

        // Process received events
        let startTime = getEpochSeconds();
        for (let event of filteredEvents) {
          try {
            await processEvents(stakingContract, chainConfig, [event]);
          } catch (err) {
            logger.warn(err);
          }
        }

        let endTime = getEpochSeconds();
        logger.debug(
          `processing ${chainName} blocks from ${b} to ${
            b + 500
          } (target: ${endBlock}) took ${endTime - startTime} seconds with ${
            filteredEvents.length
          } events`,
        );

        await redisClient.set(`${chainName}_NEWEST_BACKINDEXED_BLOCK`, b + 500);
      }
    } catch (err) {
      logger.error(err);
      await redisClient.set(`${chainName}_IS_INDEXING_FORWARD`, 'false');
    }
  }
}
