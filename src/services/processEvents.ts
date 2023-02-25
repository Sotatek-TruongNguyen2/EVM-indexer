import { ethers } from 'ethers';
import { ChainConfig } from '../types';
import { getIndexerLogger } from '../utils/logger';
import { callRPCMethod } from '../utils/rpcRequest';
import { getEventForTopic } from '../config/topic';
import { Logger } from 'winston';
import { TransferTransaction } from '../models/deposit-transaction.model';

export async function processEvents(
  contract: ethers.Contract,
  chainConfig: ChainConfig,
  events: ethers.Event[],
) {
  let logger = getIndexerLogger(`processEvents_${chainConfig.name}`);

  logger.debug(`proceeding to process ${events.length} retrieved events`);

  let eventCnt = 0;
  for (let event of events) {
    const txnHash = event.transactionHash;
    const block = await callRPCMethod(event.getBlock, logger, chainConfig.name);

    const timestamp = block.timestamp;
    const blockNumber = block.number;

    const topicHash = event.topics[0];
    const eventInfo = getEventForTopic(topicHash);
    const eventName = eventInfo.eventName;

    if (eventName === 'Transfer') {
      let args = event.args as any;
      let user = args.user;
      let pid = args.pid;
      let amount = args.amount.toString();

      await upsertTransferTxnInDb(
        {
          txnHash,
          user,
          pid,
          amount,
          timestamp,
          block: blockNumber.toString(),
        },
        logger,
      );
    }
  }
}

async function upsertTransferTxnInDb(args: any, logger: Logger) {
  //   logErrorIfAmountIsRogue(args, logger);
  //   await appendFormattedUSDPrices(args, logger);
  //   removeUndefinedValuesFromArgs(args);

  logger.debug(
    `values to be inserted in db for txn with txnHash ${
      args.txnHash
    } are ${JSON.stringify(args)}`,
  );

  let filter = { txnHash: args.txnHash };
  let existingTxn = await TransferTransaction.findOne(filter);
  console.log('existing: ', existingTxn);
  // Insert new transaction
  if (!existingTxn) {
    return await new TransferTransaction(args).save();
  }

  //   // if IN has been received, txn is no longer pending and is complete
  //   if (existingTxn.toTxnHash || args.toTxnHash) {
  //     args.pending = false;
  //   }
  //   logger.debug(
  //     `Transaction with kappa ${kappa} found, pending set to ${args.pending}. Updating...`,
  //   );
  //   return await TransferTransaction.findOneAndUpdate(filter, args, {
  //     new: true,
  //   });
}
