"use strict";
// import { ethers } from "ethers";
// import { LogDescription } from "ethers/lib/utils";
// // import { save_tx } from "./stores/transaction_history";
// import { ILogHandler } from "../../interfaces";
// import NikaStakingAbi from "../../blockchain/abi/NikaStaking.json";
// import { update_user_referral_info } from "./stores/update_user_info";
// export const referral_added_handler: ILogHandler = async (
//   logger,
//   log_params,
// ) => {
//   const abi = new ethers.utils.Interface(NikaStakingAbi);
//   let log = abi.parseLog(log_params.raw_log) as LogDescription;
//   try {
//     await update_user_referral_info(
//       ethers.utils.getAddress(log_params.raw_log.sender),
//       ethers.utils.getAddress(log.args["referral"]),
//       log.args["level"].toNumber(),
//     );
//   } catch (err: any) {
//     logger.warn(err.message);
//     throw err;
//   }
// };
