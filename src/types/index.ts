import { Block, Log } from "@ethersproject/abstract-provider";
import { ChainId } from "../common/chainId";
import { LogWithSender } from "../interfaces";

type ChainConfig = {
  contract: string;
  start_block: number;
  oldest_block?: number;
  filters: { [hash: string]: { eventName: string } };
  handlers: {
    [topic: string]: string;
  };
};

type ChainsConfig = {
  [chain: ChainId]: {
    id: ChainId;
    name: string;
    rpcUrls: () => string[];
    deployments: [ChainConfig];
  };
};

type ID = symbol;

interface Distinct {
  readonly id: ID;
}

type ValueOf<T> = T[keyof T];

type ChainHeadPtr = {
  number: number;
  hash: string;
};

type BlockPtr = {
  number: number;
  hash: string;
};

type CacheBlockPtr = {
  parent_hash: string;
  ptr: BlockPtr;
  is_finalized: boolean;
};

type BlockWithLogs = Block & {
  logs: Log[];
  // finalized: boolean;
};

export {
  ChainId,
  ChainsConfig,
  ChainConfig,
  ID,
  Distinct,
  ValueOf,
  CacheBlockPtr,
  ChainHeadPtr,
  BlockPtr,
  BlockWithLogs,
};
