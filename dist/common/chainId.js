"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.chainSupportsEIP1559 = exports.EIP1559Chains = exports.ChainId = void 0;
exports.ChainId = {
    ETH: 1,
    OPTIMISM: 10,
    CRONOS: 25,
    BSC: 56,
    BSC_TESTNET: 97,
    POLYGON: 137,
    FANTOM: 250,
    BOBA: 288,
    METIS: 1088,
    MOONBEAM: 1284,
    MOONRIVER: 1285,
    ARBITRUM: 42161,
    AVALANCHE: 43114,
    AURORA: 1313161554,
    HARMONY: 1666600000,
};
exports.EIP1559Chains = (_a = {},
    _a[exports.ChainId.ETH] = true,
    _a[exports.ChainId.OPTIMISM] = false,
    _a[exports.ChainId.CRONOS] = false,
    _a[exports.ChainId.BSC] = false,
    _a[exports.ChainId.POLYGON] = true,
    _a[exports.ChainId.FANTOM] = false,
    _a[exports.ChainId.BOBA] = false,
    _a[exports.ChainId.METIS] = false,
    _a[exports.ChainId.MOONBEAM] = true,
    _a[exports.ChainId.MOONRIVER] = true,
    _a[exports.ChainId.ARBITRUM] = false,
    _a[exports.ChainId.AVALANCHE] = true,
    _a[exports.ChainId.AURORA] = false,
    _a[exports.ChainId.HARMONY] = false,
    _a);
function chainSupportsEIP1559(chainId) {
    return chainId in exports.EIP1559Chains ? exports.EIP1559Chains[chainId] : false;
}
exports.chainSupportsEIP1559 = chainSupportsEIP1559;
