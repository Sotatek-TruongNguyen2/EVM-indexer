import { Distinct, ID } from '../types';
import { ChainId } from '../common/ChainId';
import { chainSupportsEIP1559 } from '../common/chainId';

interface NetworkArgs {
  name: string;
  chainId: ChainId;
  chainCurrency: string;
  chainCurrencyCoingeckoId?: string;
}

namespace Networks {
  export class Network implements Distinct {
    readonly id: ID;
    readonly name: string;
    readonly chainCurrency: string;
    readonly chainId: ChainId;
    // readonly tokens: Token[];
    readonly tokenAddresses: string[];
    readonly supportsEIP1559: boolean;

    readonly chainCurrencyCoingeckoId?: string;

    constructor(args: NetworkArgs) {
      this.name = args.name;
      this.chainId = args.chainId;
      this.chainCurrency = args.chainCurrency;
      this.supportsEIP1559 = chainSupportsEIP1559(args.chainId);

      this.chainCurrencyCoingeckoId = args.chainCurrencyCoingeckoId;

      // this.tokens = SwapPools.getAllSwappableTokensForNetwork(this.chainId);
      // this.tokenAddresses = this.tokens.map((t) => t.address(this.chainId));

      this.id = Symbol(`${this.name}:${this.chainId}`);
    }
  }

  export const ETH = new Network({
    name: 'Ethereum Mainnet',
    chainId: ChainId.ETH,
    chainCurrency: 'ETH',
    chainCurrencyCoingeckoId: 'ethereum',
  });

  const OPTIMISM = new Network({
    name: 'Optimism',
    chainId: ChainId.OPTIMISM,
    chainCurrency: 'ETH',
    chainCurrencyCoingeckoId: 'ethereum',
  });

  const CRONOS = new Network({
    name: 'Cronos',
    chainId: ChainId.CRONOS,
    chainCurrency: 'CRO',
    chainCurrencyCoingeckoId: 'crypto-com-chain',
  });

  const BSC = new Network({
    name: 'Binance Smart Chain',
    chainId: ChainId.BSC,
    chainCurrency: 'BNB',
    chainCurrencyCoingeckoId: 'binancecoin',
  });

  const POLYGON = new Network({
    name: 'Polygon',
    chainId: ChainId.POLYGON,
    chainCurrency: 'MATIC',
    chainCurrencyCoingeckoId: 'matic-network',
  });

  const FANTOM = new Network({
    name: 'Fantom',
    chainId: ChainId.FANTOM,
    chainCurrency: 'FTM',
    chainCurrencyCoingeckoId: 'fantom',
  });

  const BOBA = new Network({
    name: 'Boba Network',
    chainId: ChainId.BOBA,
    chainCurrency: 'ETH',
    chainCurrencyCoingeckoId: 'ethereum',
  });

  const METIS = new Network({
    name: 'Metis',
    chainId: ChainId.METIS,
    chainCurrency: 'METIS',
    chainCurrencyCoingeckoId: 'metis-token',
  });

  const MOONBEAM = new Network({
    name: 'Moonbeam',
    chainId: ChainId.MOONBEAM,
    chainCurrency: 'GLMR',
    chainCurrencyCoingeckoId: 'moonbeam',
  });

  const MOONRIVER = new Network({
    name: 'Moonriver',
    chainId: ChainId.MOONRIVER,
    chainCurrency: 'MOVR',
  });

  const ARBITRUM = new Network({
    name: 'Arbitrum',
    chainId: ChainId.ARBITRUM,
    chainCurrency: 'ETH',
    chainCurrencyCoingeckoId: 'ethereum',
  });

  const AVALANCHE = new Network({
    name: 'Avalanche C-Chain',
    chainId: ChainId.AVALANCHE,
    chainCurrency: 'AVAX',
    chainCurrencyCoingeckoId: 'avalanche-2',
  });

  const AURORA = new Network({
    name: 'Aurora',
    chainId: ChainId.AURORA,
    chainCurrency: 'ETH',
  });

  const HARMONY = new Network({
    name: 'Harmony',
    chainId: ChainId.HARMONY,
    chainCurrency: 'ONE',
    chainCurrencyCoingeckoId: 'harmony',
  });
}

export { Networks };
