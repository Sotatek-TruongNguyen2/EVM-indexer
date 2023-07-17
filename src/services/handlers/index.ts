import { user_deposit_handler } from "./user-deposit-handler";
import { user_withdraw_handler } from "./user-withdraw-handler";
import { ILogHandler } from "../../interfaces";

export const handlers = {
  user_deposit_handler,
  user_withdraw_handler,
};

export const getHandlerByName = (name: string): ILogHandler => {
  return handlers[name];
};
