"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Networks = void 0;
var chainId_1 = require("../common/chainId");
var Networks;
(function (Networks) {
    var Network = /** @class */ (function () {
        function Network(args) {
            this.name = args.name;
            this.chainId = args.chainId;
            this.chainCurrency = args.chainCurrency;
            this.supportsEIP1559 = (0, chainId_1.chainSupportsEIP1559)(args.chainId);
            this.chainCurrencyCoingeckoId = args.chainCurrencyCoingeckoId;
            // this.tokens = SwapPools.getAllSwappableTokensForNetwork(this.chainId);
            // this.tokenAddresses = this.tokens.map((t) => t.address(this.chainId));
            this.id = Symbol("".concat(this.name, ":").concat(this.chainId));
        }
        return Network;
    }());
    Networks.Network = Network;
    Networks.ETH = new Network({
        name: "Ethereum Mainnet",
        chainId: chainId_1.ChainId.ETH,
        chainCurrency: "ETH",
        chainCurrencyCoingeckoId: "ethereum",
    });
    var OPTIMISM = new Network({
        name: "Optimism",
        chainId: chainId_1.ChainId.OPTIMISM,
        chainCurrency: "ETH",
        chainCurrencyCoingeckoId: "ethereum",
    });
    var CRONOS = new Network({
        name: "Cronos",
        chainId: chainId_1.ChainId.CRONOS,
        chainCurrency: "CRO",
        chainCurrencyCoingeckoId: "crypto-com-chain",
    });
    Networks.BSC = new Network({
        name: "Binance Smart Chain",
        chainId: chainId_1.ChainId.BSC,
        chainCurrency: "BNB",
        chainCurrencyCoingeckoId: "binancecoin",
    });
    Networks.BSC_TESTNET = new Network({
        name: "Binance Smart Chain Testnet",
        chainId: chainId_1.ChainId.BSC_TESTNET,
        chainCurrency: "BNB",
        chainCurrencyCoingeckoId: "binancecoin",
    });
    var POLYGON = new Network({
        name: "Polygon",
        chainId: chainId_1.ChainId.POLYGON,
        chainCurrency: "MATIC",
        chainCurrencyCoingeckoId: "matic-network",
    });
    var FANTOM = new Network({
        name: "Fantom",
        chainId: chainId_1.ChainId.FANTOM,
        chainCurrency: "FTM",
        chainCurrencyCoingeckoId: "fantom",
    });
    var BOBA = new Network({
        name: "Boba Network",
        chainId: chainId_1.ChainId.BOBA,
        chainCurrency: "ETH",
        chainCurrencyCoingeckoId: "ethereum",
    });
    var METIS = new Network({
        name: "Metis",
        chainId: chainId_1.ChainId.METIS,
        chainCurrency: "METIS",
        chainCurrencyCoingeckoId: "metis-token",
    });
    var MOONBEAM = new Network({
        name: "Moonbeam",
        chainId: chainId_1.ChainId.MOONBEAM,
        chainCurrency: "GLMR",
        chainCurrencyCoingeckoId: "moonbeam",
    });
    var MOONRIVER = new Network({
        name: "Moonriver",
        chainId: chainId_1.ChainId.MOONRIVER,
        chainCurrency: "MOVR",
    });
    var ARBITRUM = new Network({
        name: "Arbitrum",
        chainId: chainId_1.ChainId.ARBITRUM,
        chainCurrency: "ETH",
        chainCurrencyCoingeckoId: "ethereum",
    });
    var AVALANCHE = new Network({
        name: "Avalanche C-Chain",
        chainId: chainId_1.ChainId.AVALANCHE,
        chainCurrency: "AVAX",
        chainCurrencyCoingeckoId: "avalanche-2",
    });
    var AURORA = new Network({
        name: "Aurora",
        chainId: chainId_1.ChainId.AURORA,
        chainCurrency: "ETH",
    });
    var HARMONY = new Network({
        name: "Harmony",
        chainId: chainId_1.ChainId.HARMONY,
        chainCurrency: "ONE",
        chainCurrencyCoingeckoId: "harmony",
    });
})(Networks || (Networks = {}));
exports.Networks = Networks;
