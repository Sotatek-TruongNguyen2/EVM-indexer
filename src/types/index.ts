import { ChainId } from '../common/chainId';

type ChainConfig = {
  contract: string;
  start_block: number;
  oldest_block?: number;
  filters: { [hash: string]: { eventName: string } };
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

export { ChainId, ChainsConfig, ChainConfig, ID, Distinct, ValueOf };
