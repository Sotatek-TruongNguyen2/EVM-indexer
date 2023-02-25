import { ethers } from 'ethers';
import { RedisConnection } from '../db/redis';
import { ChainConfig } from '../types';
import {
  buildTokenContract,
  getMasterChefAbi,
  getRPCProvider,
} from '../config/chainConfig';
import { getEpochSeconds } from '../utils/epoch';
import { processEvents } from './processEvents';
import { getIndexerLogger } from '../utils/logger';
import { getTopicsHash } from '../config/topic';

let FORWARD_BLOCK_INTERVAL = 350;

export async function indexForward(chainConfig: ChainConfig) {
  let logger = getIndexerLogger(`${chainConfig.name}_${indexForward.name}`);
  let chainName = chainConfig.name;
  let redisClient = await RedisConnection.getClient();

  // Only one invocation should be running per chain
  let isIndexing = await redisClient.get(`${chainName}_IS_INDEXING_FORWARD`);
  if (isIndexing === 'true') {
    logger.debug(`already in progress, skipping interval call.`);
    return;
  }

  // Release lock in about 5 minutes, incase of restart while locked
  let forwardTimeout = 300;
  logger.info(`Setting timeout ${forwardTimeout}`);
  await redisClient.set(
    `${chainName}_IS_INDEXING_FORWARD`,
    'true',
    'EX',
    forwardTimeout,
  );

  try {
    let provider = getRPCProvider(chainConfig.id);
    logger.debug(`start indexing forward`);

    // Get block intervals to get events between
    let networkLatestBlock = await provider.getBlockNumber();
    let cachedLatestBlock = await redisClient.get(
      `${chainName}_LATEST_BLOCK_INDEXED`,
    );

    let indexedLatestBlock = cachedLatestBlock
      ? parseInt(cachedLatestBlock)
      : networkLatestBlock;

    let maxBlockToIndexUntil = Math.min(
      networkLatestBlock,
      indexedLatestBlock + FORWARD_BLOCK_INTERVAL,
    );

    logger.debug(`network latest block: ${networkLatestBlock}`);
    logger.debug(`indexed latest block: ${indexedLatestBlock}`);
    logger.debug(`indexing until block: ${maxBlockToIndexUntil}`);

    // // Initialize Deposit Contract
    let stakingContractAddress = ethers.utils.getAddress(chainConfig.contract);
    let stakingContract = buildTokenContract(
      stakingContractAddress,
      getMasterChefAbi(),
      provider,
    );

    // Get events between these blocks
    let filteredEvents = await stakingContract.queryFilter(
      {
        address: stakingContractAddress,
        topics: getTopicsHash(),
      },
      indexedLatestBlock,
      maxBlockToIndexUntil,
    );

    // Process received events
    let startTime = getEpochSeconds();
    try {
      await processEvents(stakingContract, chainConfig, filteredEvents);
    } catch (err) {
      logger.warn(err);
    }
    let endTime = getEpochSeconds();
    logger.debug(`processing took ${endTime - startTime} seconds`);

    // Update the latest block processed for chain
    await redisClient.set(
      `${chainName}_LATEST_BLOCK_INDEXED`,
      maxBlockToIndexUntil,
    );
    await redisClient.set(`${chainName}_IS_INDEXING_FORWARD`, 'false');
  } catch (err) {
    logger.error(err);
    await redisClient.set(`${chainName}_IS_INDEXING_FORWARD`, 'false');
  }
}
