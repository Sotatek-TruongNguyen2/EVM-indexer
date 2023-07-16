import { user_deposit_handler } from "./user-deposit-handler";
// import { referral_added_handler } from "./referral-added-handler";
import { ILogHandler } from "../../interfaces";

export const handlers = {
  user_deposit_handler,
  // referral_added_handler,
};

export const getHandlerByName = (name: string): ILogHandler => {
  return handlers[name];
};
