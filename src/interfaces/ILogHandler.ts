import { LogWithSender } from "./EthereumOverride";
import { Logger } from "winston";

export type LogHandlerParams = {
  raw_log: LogWithSender;
  metadata: {
    timestamp: number;
    block_number: number;
  };
};
export type ILogHandler = (
  logger: Logger,
  log_params: LogHandlerParams,
) => Promise<any>;
