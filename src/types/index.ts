import { ChainId } from '../common/chainId';

type ChainConfig = {
  id: ChainId;
  name: string;
  contract: string;
  rpc: () => string | undefined;
  startBlock: number;
  oldestBlock?: number;
};

type ChainsConfig = {
  [chain: ChainId]: ChainConfig;
};

type ID = symbol;

interface Distinct {
  readonly id: ID;
}

type ValueOf<T> = T[keyof T];

export { ChainId, ChainsConfig, ChainConfig, ID, Distinct, ValueOf };
