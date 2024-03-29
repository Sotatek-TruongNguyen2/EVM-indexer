import { ethers } from "ethers";
import { LogDescription } from "ethers/lib/utils";
import { save_tx } from "./stores/transaction_history";
import { ILogHandler } from "../../interfaces";
import NikaStakingAbi from "../../blockchain/abi/NikaStaking.json";
import { TransactionCategory } from "./constants/transaction-category";
import {
  update_user_branches,
  update_user_info,
} from "./stores/update_user_info";

export const user_deposit_handler: ILogHandler = async (logger, log_params) => {
  const abi = new ethers.utils.Interface(NikaStakingAbi);
  let log = abi.parseLog(log_params.raw_log) as LogDescription;

  const sender = ethers.utils.getAddress(log_params.raw_log.sender);
  const user = ethers.utils.getAddress(log.args["user"]);
  const referrer = ethers.utils.getAddress(log.args["referrer"]);
  const deposit_amount = log.args["amount"].toString();
  try {
    await save_tx({
      referrer,
      sender,
      user,
      amount: deposit_amount,
      block_number: log_params.metadata.block_number,
      category: TransactionCategory.DEPOSIT,
      timestamp: log_params.metadata.timestamp,
      tx_hash: log_params.raw_log.transactionHash,
    });

    // Make sure it returns old data
    const current_user = await update_user_info(
      user,
      deposit_amount,
      referrer,
      true,
      false,
      // {
      //   address: user,
      //   referralBy: referrer,
      //   deposit_amount,
      // },
      // true,
    );

    // Update all user ancestor, descendant in the referral Tree
    await update_user_branches(
      current_user,
      deposit_amount,
      log_params.metadata.timestamp,
    );
  } catch (err: any) {
    // logger.warn(`Error when do call the handler err.message`);
    throw err;
  }
};
