"use strict";
// import { ethers } from "ethers";
// import { RedisConnection } from "../db/redis";
// import { ChainConfig } from "../types";
// import {
//   buildTokenContract,
//   getMasterChefAbi,
//   getValidatorSetABI,
//   getRPCProvider,
// } from "../config/chainConfig";
// // import {getTopicsHash} from "../config/topics.js";
// import { processEvents } from "./processEvents";
// import { getIndexerLogger } from "../utils/logger";
// import { getEpochSeconds } from "../utils/epoch";
// import { getTopicsHash } from "../config/topic";
// import { getEventByFilters } from "../utils/eventFilter";
// // import {buildBridgeContract, getBridgeContractAbi, getW3Provider} from "../config/chainConfig.js";
// export async function indexOlderTransactions(chainConfig: ChainConfig) {
//   if (chainConfig.oldestBlock) {
//     let logger = getIndexerLogger(
//       `${chainConfig.name}_${indexOlderTransactions.name}`,
//     );
//     let chainName = chainConfig.name;
//     let redisClient = await RedisConnection.getClient();
//     try {
//       // Get the block you wish to index until
//       let cachedStartBlock = await redisClient.get(
//         `${chainName}_NEWEST_BACKINDEXED_BLOCK`,
//       );
//       let startBlock = cachedStartBlock
//         ? parseInt(cachedStartBlock)
//         : chainConfig.oldestBlock;
//       let endBlock = chainConfig.startBlock;
//       console.log(startBlock, endBlock);
//       for (let b = startBlock; b <= endBlock; b += 200) {
//         logger.debug(`start indexing back to front from: ${b} to ${b + 200}`);
//         // Get events between these blocks
//         let filteredEvents = await getEventByFilters(
//           chainConfig,
//           {
//             address: ethers.utils.getAddress(chainConfig.contract),
//             topics: getTopicsHash(),
//             abi: getValidatorSetABI(),
//           },
//           b,
//           b + 200,
//           logger,
//         );
//         // Process received events
//         let startTime = getEpochSeconds();
//         for (let event of filteredEvents) {
//           try {
//             await processEvents(chainConfig, [event]);
//           } catch (err) {
//             logger.warn(err);
//           }
//         }
//         let endTime = getEpochSeconds();
//         logger.debug(
//           `processing ${chainName} blocks from ${b} to ${
//             b + 200
//           } (target: ${endBlock}) took ${endTime - startTime} seconds with ${
//             filteredEvents.length
//           } events`,
//         );
//         await redisClient.set(`${chainName}_NEWEST_BACKINDEXED_BLOCK`, b + 200);
//       }
//     } catch (err) {
//       logger.error(err);
//     }
//   }
// }
