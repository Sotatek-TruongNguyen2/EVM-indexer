"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMasterChefAbi = exports.getBareERC20Abi = exports.buildTokenContract = exports.getValidatorSetABI = exports.setProviderIndex = exports.getRPCProvider = exports.ChainConfig = void 0;
//@ts-ignore
var ethers_1 = require("ethers");
var chainId_1 = require("../common/chainId");
var networks_1 = require("./networks");
var _CURRENT_PROVIDER_INDEX = 0;
var _PROVIDER_CACHE = {};
var ChainConfig = (_a = {},
    // [ChainId.ETH]: {
    //   id: ChainId.ETH,
    //   name: Networks.ETH.name,
    //   rpc: () => process.env.ETH_RPC,
    //   contract: '0xef0881ec094552b2e128cf945ef17a6752b4ec5d',
    //   startBlock: 16705275, // Block to backindex until
    //   oldestBlock: 16692732, // Start indexing older txns from here until startblock
    //   // tokens: buildTokenInfo(ChainId.ETH),
    // },
    // [ChainId.BSC]: {
    //   id: ChainId.BSC,
    //   name: Networks.BSC.name,
    //   rpcUrls: () => [
    //     process.env.BSC_RPC as string,
    //     process.env.BSC_RPC_1 as string,
    //     process.env.BSC_RPC_2 as string,
    //     process.env.BSC_RPC_3 as string,
    //     process.env.BSC_RPC_4 as string,
    //   ],
    //   contract: '0x0000000000000000000000000000000000001000',
    //   startBlock: 26243447, // Block to backindex until
    //   oldestBlock: 26214870, // Start indexing older txns from here until startblock
    //   // tokens: buildTokenInfo(ChainId.ETH),
    // },
    _a[chainId_1.ChainId.BSC_TESTNET] = {
        id: chainId_1.ChainId.BSC_TESTNET,
        name: networks_1.Networks.BSC_TESTNET.name,
        rpcUrls: function () {
            var _a;
            return process.env.BSC_RPC ? (_a = process.env.BSC_RPC) === null || _a === void 0 ? void 0 : _a.split(",") : [];
        },
        deployments: [
            {
                contract: "0x81d7d8cad69dc2a767dce326e03d1bd388c28aa5",
                start_block: 31348852,
                oldest_block: 31348852,
                // tokens: buildTokenInfo(ChainId.ETH),
                filters: {
                    // "0x7ed629d198faf210a8b65c3c30bf1ab4a789fb6123ed208a03358fcebe7c9dd8":
                    //   {
                    //     eventName: "ReferralLevelAdded",
                    //   },
                    "0x5548c837ab068cf56a2c2479df0882a4922fd203edb7517321831d95078c5f62": {
                        eventName: "Deposit",
                    },
                    "0x884edad9ce6fa2440d8a54cc123490eb96d2768479d49ff9c7366125a9424364": {
                        eventName: "Withdraw",
                    },
                },
                handlers: {
                    "0x5548c837ab068cf56a2c2479df0882a4922fd203edb7517321831d95078c5f62": "user_deposit_handler",
                    "0x884edad9ce6fa2440d8a54cc123490eb96d2768479d49ff9c7366125a9424364": "user_withdraw_handler",
                },
            },
        ],
    },
    _a);
exports.ChainConfig = ChainConfig;
// /**
//  * Returns a list of objects, with the token address on the chain as the key
//  * along with addresses and decimals as the values
//  * @param {number} chainId
//  * @returns {*[]}
//  */
// function buildTokenInfo(chainId: ChainId) {
//   // let tokenList = SwapPools.getAllSwappableTokensForNetwork(chainId);
//   // Account for native token transfers
//   if (chainId === ChainId.ETH) {
//     tokenList.push(Tokens.WETH);
//   } else if (chainId === ChainId.AVALANCHE) {
//     tokenList.push(Tokens.WAVAX);
//   } else if (chainId === ChainId.MOONRIVER) {
//     tokenList.push(Tokens.WMOVR);
//   }
//   let resObj = {};
//   tokenList.forEach((tokenObj) => {
//     let address = tokenObj.address(chainId);
//     let decimals = tokenObj.decimals(chainId);
//     let symbol = tokenObj.symbol;
//     let contract = (provider) =>
//       new ethers.Contract(address, getBareERC20Abi(), provider);
//     if (address) {
//       resObj[`${address}`] = { decimals, symbol, contract };
//       let checksumAddress = ethers.utils.getAddress(address);
//       resObj[`${checksumAddress}`] = { decimals, symbol, contract };
//     }
//   });
//   return resObj;
// }
/**
 * Gets a ethers provider object for a chain
 * @param chainId
 * @returns {Object}
 */
function getRPCProvider(chainId) {
    if (_CURRENT_PROVIDER_INDEX < ChainConfig[chainId].rpcUrls().length) {
        _PROVIDER_CACHE[chainId] = new ethers_1.ethers.providers.StaticJsonRpcProvider(ChainConfig[chainId].rpcUrls()[_CURRENT_PROVIDER_INDEX]);
    }
    // console.log(
    //   "_PROVIDER_CACHE[chainId]: ",
    //   _PROVIDER_CACHE[chainId].connection.url,
    // );
    return _PROVIDER_CACHE[chainId];
}
exports.getRPCProvider = getRPCProvider;
function setProviderIndex(chainId) {
    _CURRENT_PROVIDER_INDEX += 1;
    if (_CURRENT_PROVIDER_INDEX >= ChainConfig[chainId].rpcUrls().length) {
        _CURRENT_PROVIDER_INDEX = 0;
    }
    return getRPCProvider(chainId);
}
exports.setProviderIndex = setProviderIndex;
// /**
//  * Gets a web3 contract object for a token on a particular chain
//  * @param {String} chainId
//  * @param {String} tokenAddress
//  * @returns {ethers.Contract}
//  */
// function getTokenContract(chainId, tokenAddress) {
//   if (
//     _TOKEN_CONTRACT_CACHE[chainId] &&
//     _TOKEN_CONTRACT_CACHE[chainId][tokenAddress]
//   ) {
//     return _TOKEN_CONTRACT_CACHE[chainId][tokenAddress];
//   }
//   if (!_TOKEN_CONTRACT_CACHE[chainId]) {
//     _TOKEN_CONTRACT_CACHE[chainId] = {};
//   }
//   console.debug(`Getting token contract for ${tokenAddress} on ${chainId}`);
//   _TOKEN_CONTRACT_CACHE[chainId][tokenAddress] = new ethers.Contract(
//     tokenAddress,
//     getBareERC20Abi(),
//     getW3Provider(chainId),
//   );
//   return _TOKEN_CONTRACT_CACHE[chainId][tokenAddress];
// }
/**
 * Gets a web3 contract object for a token on a particular chain
 * @param {String} contractAddress
 * @param {Array} abi
 * @param {ethers.providers.BaseProvider} provider
 * @returns {ethers.BaseContract}
 */
function buildTokenContract(contractAddress, abi, provider) {
    return new ethers_1.ethers.Contract(contractAddress, abi, provider);
}
exports.buildTokenContract = buildTokenContract;
// /**
//  * Returns stable swap pools for the chain
//  * @param chainId
//  * @returns {{nETH: string | undefined, nUSD: string | undefined}}
//  */
// function getStableSwapPoolForNetwork(chainId) {
//   return {
//     nUSD: SwapPools.stableswapPoolForNetwork(chainId)?.swapAddress,
//     nETH: SwapPools.ethSwapPoolForNetwork(chainId)?.swapAddress,
//   };
// }
// /**
//  * Returns ABI for an deployed synapse bridge contract
//  * @returns {Array}
//  */
// function getBridgeContractAbi() {
//   return [
//     {
//       anonymous: false,
//       inputs: [
//         {
//           indexed: false,
//           internalType: 'address',
//           name: 'previousAdmin',
//           type: 'address',
//         },
//         {
//           indexed: false,
//           internalType: 'address',
//           name: 'newAdmin',
//           type: 'address',
//         },
//       ],
//       name: 'AdminChanged',
//       type: 'event',
//     },
//     {
//       anonymous: false,
//       inputs: [
//         {
//           indexed: true,
//           internalType: 'address',
//           name: 'implementation',
//           type: 'address',
//         },
//       ],
//       name: 'Upgraded',
//       type: 'event',
//     },
//     { stateMutability: 'payable', type: 'fallback' },
//     {
//       inputs: [],
//       name: 'admin',
//       outputs: [{ internalType: 'address', name: '', type: 'address' }],
//       stateMutability: 'nonpayable',
//       type: 'function',
//     },
//     {
//       inputs: [{ internalType: 'address', name: 'newAdmin', type: 'address' }],
//       name: 'changeAdmin',
//       outputs: [],
//       stateMutability: 'nonpayable',
//       type: 'function',
//     },
//     {
//       inputs: [],
//       name: 'implementation',
//       outputs: [{ internalType: 'address', name: '', type: 'address' }],
//       stateMutability: 'nonpayable',
//       type: 'function',
//     },
//     {
//       inputs: [
//         { internalType: 'address', name: 'newImplementation', type: 'address' },
//       ],
//       name: 'upgradeTo',
//       outputs: [],
//       stateMutability: 'nonpayable',
//       type: 'function',
//     },
//     {
//       inputs: [
//         { internalType: 'address', name: 'newImplementation', type: 'address' },
//         { internalType: 'bytes', name: 'data', type: 'bytes' },
//       ],
//       name: 'upgradeToAndCall',
//       outputs: [],
//       stateMutability: 'payable',
//       type: 'function',
//     },
//     { stateMutability: 'payable', type: 'receive' },
//     {
//       anonymous: false,
//       inputs: [
//         {
//           indexed: false,
//           internalType: 'address',
//           name: 'account',
//           type: 'address',
//         },
//       ],
//       name: 'Paused',
//       type: 'event',
//     },
//     {
//       anonymous: false,
//       inputs: [
//         {
//           indexed: true,
//           internalType: 'bytes32',
//           name: 'role',
//           type: 'bytes32',
//         },
//         {
//           indexed: true,
//           internalType: 'bytes32',
//           name: 'previousAdminRole',
//           type: 'bytes32',
//         },
//         {
//           indexed: true,
//           internalType: 'bytes32',
//           name: 'newAdminRole',
//           type: 'bytes32',
//         },
//       ],
//       name: 'RoleAdminChanged',
//       type: 'event',
//     },
//     {
//       anonymous: false,
//       inputs: [
//         {
//           indexed: true,
//           internalType: 'bytes32',
//           name: 'role',
//           type: 'bytes32',
//         },
//         {
//           indexed: true,
//           internalType: 'address',
//           name: 'account',
//           type: 'address',
//         },
//         {
//           indexed: true,
//           internalType: 'address',
//           name: 'sender',
//           type: 'address',
//         },
//       ],
//       name: 'RoleGranted',
//       type: 'event',
//     },
//     {
//       anonymous: false,
//       inputs: [
//         {
//           indexed: true,
//           internalType: 'bytes32',
//           name: 'role',
//           type: 'bytes32',
//         },
//         {
//           indexed: true,
//           internalType: 'address',
//           name: 'account',
//           type: 'address',
//         },
//         {
//           indexed: true,
//           internalType: 'address',
//           name: 'sender',
//           type: 'address',
//         },
//       ],
//       name: 'RoleRevoked',
//       type: 'event',
//     },
//     {
//       anonymous: false,
//       inputs: [
//         { indexed: true, internalType: 'address', name: 'to', type: 'address' },
//         {
//           indexed: false,
//           internalType: 'uint256',
//           name: 'chainId',
//           type: 'uint256',
//         },
//         {
//           indexed: false,
//           internalType: 'contract IERC20',
//           name: 'token',
//           type: 'address',
//         },
//         {
//           indexed: false,
//           internalType: 'uint256',
//           name: 'amount',
//           type: 'uint256',
//         },
//       ],
//       name: 'TokenDeposit',
//       type: 'event',
//     },
//     {
//       anonymous: false,
//       inputs: [
//         { indexed: true, internalType: 'address', name: 'to', type: 'address' },
//         {
//           indexed: false,
//           internalType: 'uint256',
//           name: 'chainId',
//           type: 'uint256',
//         },
//         {
//           indexed: false,
//           internalType: 'contract IERC20',
//           name: 'token',
//           type: 'address',
//         },
//         {
//           indexed: false,
//           internalType: 'uint256',
//           name: 'amount',
//           type: 'uint256',
//         },
//         {
//           indexed: false,
//           internalType: 'uint8',
//           name: 'tokenIndexFrom',
//           type: 'uint8',
//         },
//         {
//           indexed: false,
//           internalType: 'uint8',
//           name: 'tokenIndexTo',
//           type: 'uint8',
//         },
//         {
//           indexed: false,
//           internalType: 'uint256',
//           name: 'minDy',
//           type: 'uint256',
//         },
//         {
//           indexed: false,
//           internalType: 'uint256',
//           name: 'deadline',
//           type: 'uint256',
//         },
//       ],
//       name: 'TokenDepositAndSwap',
//       type: 'event',
//     },
//     {
//       anonymous: false,
//       inputs: [
//         { indexed: true, internalType: 'address', name: 'to', type: 'address' },
//         {
//           indexed: false,
//           internalType: 'contract IERC20Mintable',
//           name: 'token',
//           type: 'address',
//         },
//         {
//           indexed: false,
//           internalType: 'uint256',
//           name: 'amount',
//           type: 'uint256',
//         },
//         {
//           indexed: false,
//           internalType: 'uint256',
//           name: 'fee',
//           type: 'uint256',
//         },
//         {
//           indexed: true,
//           internalType: 'bytes32',
//           name: 'kappa',
//           type: 'bytes32',
//         },
//       ],
//       name: 'TokenMint',
//       type: 'event',
//     },
//     {
//       anonymous: false,
//       inputs: [
//         { indexed: true, internalType: 'address', name: 'to', type: 'address' },
//         {
//           indexed: false,
//           internalType: 'contract IERC20Mintable',
//           name: 'token',
//           type: 'address',
//         },
//         {
//           indexed: false,
//           internalType: 'uint256',
//           name: 'amount',
//           type: 'uint256',
//         },
//         {
//           indexed: false,
//           internalType: 'uint256',
//           name: 'fee',
//           type: 'uint256',
//         },
//         {
//           indexed: false,
//           internalType: 'uint8',
//           name: 'tokenIndexFrom',
//           type: 'uint8',
//         },
//         {
//           indexed: false,
//           internalType: 'uint8',
//           name: 'tokenIndexTo',
//           type: 'uint8',
//         },
//         {
//           indexed: false,
//           internalType: 'uint256',
//           name: 'minDy',
//           type: 'uint256',
//         },
//         {
//           indexed: false,
//           internalType: 'uint256',
//           name: 'deadline',
//           type: 'uint256',
//         },
//         {
//           indexed: false,
//           internalType: 'bool',
//           name: 'swapSuccess',
//           type: 'bool',
//         },
//         {
//           indexed: true,
//           internalType: 'bytes32',
//           name: 'kappa',
//           type: 'bytes32',
//         },
//       ],
//       name: 'TokenMintAndSwap',
//       type: 'event',
//     },
//     {
//       anonymous: false,
//       inputs: [
//         { indexed: true, internalType: 'address', name: 'to', type: 'address' },
//         {
//           indexed: false,
//           internalType: 'uint256',
//           name: 'chainId',
//           type: 'uint256',
//         },
//         {
//           indexed: false,
//           internalType: 'contract IERC20',
//           name: 'token',
//           type: 'address',
//         },
//         {
//           indexed: false,
//           internalType: 'uint256',
//           name: 'amount',
//           type: 'uint256',
//         },
//       ],
//       name: 'TokenRedeem',
//       type: 'event',
//     },
//     {
//       anonymous: false,
//       inputs: [
//         { indexed: true, internalType: 'address', name: 'to', type: 'address' },
//         {
//           indexed: false,
//           internalType: 'uint256',
//           name: 'chainId',
//           type: 'uint256',
//         },
//         {
//           indexed: false,
//           internalType: 'contract IERC20',
//           name: 'token',
//           type: 'address',
//         },
//         {
//           indexed: false,
//           internalType: 'uint256',
//           name: 'amount',
//           type: 'uint256',
//         },
//         {
//           indexed: false,
//           internalType: 'uint8',
//           name: 'swapTokenIndex',
//           type: 'uint8',
//         },
//         {
//           indexed: false,
//           internalType: 'uint256',
//           name: 'swapMinAmount',
//           type: 'uint256',
//         },
//         {
//           indexed: false,
//           internalType: 'uint256',
//           name: 'swapDeadline',
//           type: 'uint256',
//         },
//       ],
//       name: 'TokenRedeemAndRemove',
//       type: 'event',
//     },
//     {
//       anonymous: false,
//       inputs: [
//         { indexed: true, internalType: 'address', name: 'to', type: 'address' },
//         {
//           indexed: false,
//           internalType: 'uint256',
//           name: 'chainId',
//           type: 'uint256',
//         },
//         {
//           indexed: false,
//           internalType: 'contract IERC20',
//           name: 'token',
//           type: 'address',
//         },
//         {
//           indexed: false,
//           internalType: 'uint256',
//           name: 'amount',
//           type: 'uint256',
//         },
//         {
//           indexed: false,
//           internalType: 'uint8',
//           name: 'tokenIndexFrom',
//           type: 'uint8',
//         },
//         {
//           indexed: false,
//           internalType: 'uint8',
//           name: 'tokenIndexTo',
//           type: 'uint8',
//         },
//         {
//           indexed: false,
//           internalType: 'uint256',
//           name: 'minDy',
//           type: 'uint256',
//         },
//         {
//           indexed: false,
//           internalType: 'uint256',
//           name: 'deadline',
//           type: 'uint256',
//         },
//       ],
//       name: 'TokenRedeemAndSwap',
//       type: 'event',
//     },
//     {
//       anonymous: false,
//       inputs: [
//         { indexed: true, internalType: 'address', name: 'to', type: 'address' },
//         {
//           indexed: false,
//           internalType: 'contract IERC20',
//           name: 'token',
//           type: 'address',
//         },
//         {
//           indexed: false,
//           internalType: 'uint256',
//           name: 'amount',
//           type: 'uint256',
//         },
//         {
//           indexed: false,
//           internalType: 'uint256',
//           name: 'fee',
//           type: 'uint256',
//         },
//         {
//           indexed: true,
//           internalType: 'bytes32',
//           name: 'kappa',
//           type: 'bytes32',
//         },
//       ],
//       name: 'TokenWithdraw',
//       type: 'event',
//     },
//     {
//       anonymous: false,
//       inputs: [
//         { indexed: true, internalType: 'address', name: 'to', type: 'address' },
//         {
//           indexed: false,
//           internalType: 'contract IERC20',
//           name: 'token',
//           type: 'address',
//         },
//         {
//           indexed: false,
//           internalType: 'uint256',
//           name: 'amount',
//           type: 'uint256',
//         },
//         {
//           indexed: false,
//           internalType: 'uint256',
//           name: 'fee',
//           type: 'uint256',
//         },
//         {
//           indexed: false,
//           internalType: 'uint8',
//           name: 'swapTokenIndex',
//           type: 'uint8',
//         },
//         {
//           indexed: false,
//           internalType: 'uint256',
//           name: 'swapMinAmount',
//           type: 'uint256',
//         },
//         {
//           indexed: false,
//           internalType: 'uint256',
//           name: 'swapDeadline',
//           type: 'uint256',
//         },
//         {
//           indexed: false,
//           internalType: 'bool',
//           name: 'swapSuccess',
//           type: 'bool',
//         },
//         {
//           indexed: true,
//           internalType: 'bytes32',
//           name: 'kappa',
//           type: 'bytes32',
//         },
//       ],
//       name: 'TokenWithdrawAndRemove',
//       type: 'event',
//     },
//     {
//       anonymous: false,
//       inputs: [
//         {
//           indexed: false,
//           internalType: 'address',
//           name: 'account',
//           type: 'address',
//         },
//       ],
//       name: 'Unpaused',
//       type: 'event',
//     },
//     {
//       inputs: [],
//       name: 'DEFAULT_ADMIN_ROLE',
//       outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
//       stateMutability: 'view',
//       type: 'function',
//     },
//     {
//       inputs: [],
//       name: 'GOVERNANCE_ROLE',
//       outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
//       stateMutability: 'view',
//       type: 'function',
//     },
//     {
//       inputs: [],
//       name: 'NODEGROUP_ROLE',
//       outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
//       stateMutability: 'view',
//       type: 'function',
//     },
//     {
//       inputs: [],
//       name: 'WETH_ADDRESS',
//       outputs: [{ internalType: 'address payable', name: '', type: 'address' }],
//       stateMutability: 'view',
//       type: 'function',
//     },
//     {
//       inputs: [],
//       name: 'bridgeVersion',
//       outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
//       stateMutability: 'view',
//       type: 'function',
//     },
//     {
//       inputs: [],
//       name: 'chainGasAmount',
//       outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
//       stateMutability: 'view',
//       type: 'function',
//     },
//     {
//       inputs: [
//         { internalType: 'address', name: 'to', type: 'address' },
//         { internalType: 'uint256', name: 'chainId', type: 'uint256' },
//         { internalType: 'contract IERC20', name: 'token', type: 'address' },
//         { internalType: 'uint256', name: 'amount', type: 'uint256' },
//       ],
//       name: 'deposit',
//       outputs: [],
//       stateMutability: 'nonpayable',
//       type: 'function',
//     },
//     {
//       inputs: [
//         { internalType: 'address', name: 'to', type: 'address' },
//         { internalType: 'uint256', name: 'chainId', type: 'uint256' },
//         { internalType: 'contract IERC20', name: 'token', type: 'address' },
//         { internalType: 'uint256', name: 'amount', type: 'uint256' },
//         { internalType: 'uint8', name: 'tokenIndexFrom', type: 'uint8' },
//         { internalType: 'uint8', name: 'tokenIndexTo', type: 'uint8' },
//         { internalType: 'uint256', name: 'minDy', type: 'uint256' },
//         { internalType: 'uint256', name: 'deadline', type: 'uint256' },
//       ],
//       name: 'depositAndSwap',
//       outputs: [],
//       stateMutability: 'nonpayable',
//       type: 'function',
//     },
//     {
//       inputs: [
//         { internalType: 'address', name: 'tokenAddress', type: 'address' },
//       ],
//       name: 'getFeeBalance',
//       outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
//       stateMutability: 'view',
//       type: 'function',
//     },
//     {
//       inputs: [{ internalType: 'bytes32', name: 'role', type: 'bytes32' }],
//       name: 'getRoleAdmin',
//       outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
//       stateMutability: 'view',
//       type: 'function',
//     },
//     {
//       inputs: [
//         { internalType: 'bytes32', name: 'role', type: 'bytes32' },
//         { internalType: 'uint256', name: 'index', type: 'uint256' },
//       ],
//       name: 'getRoleMember',
//       outputs: [{ internalType: 'address', name: '', type: 'address' }],
//       stateMutability: 'view',
//       type: 'function',
//     },
//     {
//       inputs: [{ internalType: 'bytes32', name: 'role', type: 'bytes32' }],
//       name: 'getRoleMemberCount',
//       outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
//       stateMutability: 'view',
//       type: 'function',
//     },
//     {
//       inputs: [
//         { internalType: 'bytes32', name: 'role', type: 'bytes32' },
//         { internalType: 'address', name: 'account', type: 'address' },
//       ],
//       name: 'grantRole',
//       outputs: [],
//       stateMutability: 'nonpayable',
//       type: 'function',
//     },
//     {
//       inputs: [
//         { internalType: 'bytes32', name: 'role', type: 'bytes32' },
//         { internalType: 'address', name: 'account', type: 'address' },
//       ],
//       name: 'hasRole',
//       outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
//       stateMutability: 'view',
//       type: 'function',
//     },
//     {
//       inputs: [],
//       name: 'initialize',
//       outputs: [],
//       stateMutability: 'nonpayable',
//       type: 'function',
//     },
//     {
//       inputs: [{ internalType: 'bytes32', name: 'kappa', type: 'bytes32' }],
//       name: 'kappaExists',
//       outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
//       stateMutability: 'view',
//       type: 'function',
//     },
//     {
//       inputs: [
//         { internalType: 'address payable', name: 'to', type: 'address' },
//         {
//           internalType: 'contract IERC20Mintable',
//           name: 'token',
//           type: 'address',
//         },
//         { internalType: 'uint256', name: 'amount', type: 'uint256' },
//         { internalType: 'uint256', name: 'fee', type: 'uint256' },
//         { internalType: 'bytes32', name: 'kappa', type: 'bytes32' },
//       ],
//       name: 'mint',
//       outputs: [],
//       stateMutability: 'nonpayable',
//       type: 'function',
//     },
//     {
//       inputs: [
//         { internalType: 'address payable', name: 'to', type: 'address' },
//         {
//           internalType: 'contract IERC20Mintable',
//           name: 'token',
//           type: 'address',
//         },
//         { internalType: 'uint256', name: 'amount', type: 'uint256' },
//         { internalType: 'uint256', name: 'fee', type: 'uint256' },
//         {
//           internalType: 'contract IMetaSwapDeposit',
//           name: 'pool',
//           type: 'address',
//         },
//         { internalType: 'uint8', name: 'tokenIndexFrom', type: 'uint8' },
//         { internalType: 'uint8', name: 'tokenIndexTo', type: 'uint8' },
//         { internalType: 'uint256', name: 'minDy', type: 'uint256' },
//         { internalType: 'uint256', name: 'deadline', type: 'uint256' },
//         { internalType: 'bytes32', name: 'kappa', type: 'bytes32' },
//       ],
//       name: 'mintAndSwap',
//       outputs: [],
//       stateMutability: 'nonpayable',
//       type: 'function',
//     },
//     {
//       inputs: [],
//       name: 'pause',
//       outputs: [],
//       stateMutability: 'nonpayable',
//       type: 'function',
//     },
//     {
//       inputs: [],
//       name: 'paused',
//       outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
//       stateMutability: 'view',
//       type: 'function',
//     },
//     {
//       inputs: [
//         { internalType: 'address', name: 'to', type: 'address' },
//         { internalType: 'uint256', name: 'chainId', type: 'uint256' },
//         {
//           internalType: 'contract ERC20Burnable',
//           name: 'token',
//           type: 'address',
//         },
//         { internalType: 'uint256', name: 'amount', type: 'uint256' },
//       ],
//       name: 'redeem',
//       outputs: [],
//       stateMutability: 'nonpayable',
//       type: 'function',
//     },
//     {
//       inputs: [
//         { internalType: 'address', name: 'to', type: 'address' },
//         { internalType: 'uint256', name: 'chainId', type: 'uint256' },
//         {
//           internalType: 'contract ERC20Burnable',
//           name: 'token',
//           type: 'address',
//         },
//         { internalType: 'uint256', name: 'amount', type: 'uint256' },
//         { internalType: 'uint8', name: 'swapTokenIndex', type: 'uint8' },
//         { internalType: 'uint256', name: 'swapMinAmount', type: 'uint256' },
//         { internalType: 'uint256', name: 'swapDeadline', type: 'uint256' },
//       ],
//       name: 'redeemAndRemove',
//       outputs: [],
//       stateMutability: 'nonpayable',
//       type: 'function',
//     },
//     {
//       inputs: [
//         { internalType: 'address', name: 'to', type: 'address' },
//         { internalType: 'uint256', name: 'chainId', type: 'uint256' },
//         {
//           internalType: 'contract ERC20Burnable',
//           name: 'token',
//           type: 'address',
//         },
//         { internalType: 'uint256', name: 'amount', type: 'uint256' },
//         { internalType: 'uint8', name: 'tokenIndexFrom', type: 'uint8' },
//         { internalType: 'uint8', name: 'tokenIndexTo', type: 'uint8' },
//         { internalType: 'uint256', name: 'minDy', type: 'uint256' },
//         { internalType: 'uint256', name: 'deadline', type: 'uint256' },
//       ],
//       name: 'redeemAndSwap',
//       outputs: [],
//       stateMutability: 'nonpayable',
//       type: 'function',
//     },
//     {
//       inputs: [
//         { internalType: 'bytes32', name: 'role', type: 'bytes32' },
//         { internalType: 'address', name: 'account', type: 'address' },
//       ],
//       name: 'renounceRole',
//       outputs: [],
//       stateMutability: 'nonpayable',
//       type: 'function',
//     },
//     {
//       inputs: [
//         { internalType: 'bytes32', name: 'role', type: 'bytes32' },
//         { internalType: 'address', name: 'account', type: 'address' },
//       ],
//       name: 'revokeRole',
//       outputs: [],
//       stateMutability: 'nonpayable',
//       type: 'function',
//     },
//     {
//       inputs: [{ internalType: 'uint256', name: 'amount', type: 'uint256' }],
//       name: 'setChainGasAmount',
//       outputs: [],
//       stateMutability: 'nonpayable',
//       type: 'function',
//     },
//     {
//       inputs: [
//         {
//           internalType: 'address payable',
//           name: '_wethAddress',
//           type: 'address',
//         },
//       ],
//       name: 'setWethAddress',
//       outputs: [],
//       stateMutability: 'nonpayable',
//       type: 'function',
//     },
//     {
//       inputs: [],
//       name: 'startBlockNumber',
//       outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
//       stateMutability: 'view',
//       type: 'function',
//     },
//     {
//       inputs: [],
//       name: 'unpause',
//       outputs: [],
//       stateMutability: 'nonpayable',
//       type: 'function',
//     },
//     {
//       inputs: [
//         { internalType: 'address', name: 'to', type: 'address' },
//         { internalType: 'contract IERC20', name: 'token', type: 'address' },
//         { internalType: 'uint256', name: 'amount', type: 'uint256' },
//         { internalType: 'uint256', name: 'fee', type: 'uint256' },
//         { internalType: 'bytes32', name: 'kappa', type: 'bytes32' },
//       ],
//       name: 'withdraw',
//       outputs: [],
//       stateMutability: 'nonpayable',
//       type: 'function',
//     },
//     {
//       inputs: [
//         { internalType: 'address', name: 'to', type: 'address' },
//         { internalType: 'contract IERC20', name: 'token', type: 'address' },
//         { internalType: 'uint256', name: 'amount', type: 'uint256' },
//         { internalType: 'uint256', name: 'fee', type: 'uint256' },
//         { internalType: 'contract ISwap', name: 'pool', type: 'address' },
//         { internalType: 'uint8', name: 'swapTokenIndex', type: 'uint8' },
//         { internalType: 'uint256', name: 'swapMinAmount', type: 'uint256' },
//         { internalType: 'uint256', name: 'swapDeadline', type: 'uint256' },
//         { internalType: 'bytes32', name: 'kappa', type: 'bytes32' },
//       ],
//       name: 'withdrawAndRemove',
//       outputs: [],
//       stateMutability: 'nonpayable',
//       type: 'function',
//     },
//     {
//       inputs: [
//         { internalType: 'contract IERC20', name: 'token', type: 'address' },
//         { internalType: 'address', name: 'to', type: 'address' },
//       ],
//       name: 'withdrawFees',
//       outputs: [],
//       stateMutability: 'nonpayable',
//       type: 'function',
//     },
//     {
//       inputs: [
//         { internalType: 'address', name: 'initialLogic', type: 'address' },
//         { internalType: 'address', name: 'initialAdmin', type: 'address' },
//         { internalType: 'bytes', name: '_data', type: 'bytes' },
//       ],
//       stateMutability: 'payable',
//       type: 'constructor',
//     },
//   ];
// }
// /**
//  * Returns ABI for the stable swap pool
//  * @returns {Array}
//  */
// function getBasePoolAbi() {
//   return [
//     {
//       inputs: [{ internalType: 'uint8', name: 'index', type: 'uint8' }],
//       name: 'getToken',
//       outputs: [{ internalType: 'contract IERC20', name: '', type: 'address' }],
//       stateMutability: 'view',
//       type: 'function',
//     },
//     {
//       inputs: [{ internalType: 'uint256', name: 'index', type: 'uint256' }],
//       name: 'getAdminBalance',
//       outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
//       stateMutability: 'view',
//       type: 'function',
//     },
//     {
//       inputs: [],
//       name: 'getVirtualPrice',
//       outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
//       stateMutability: 'view',
//       type: 'function',
//     },
//   ];
// }
// /**
//  * Returns ABI for an ERC 20 token, which is the ABI for every token on a chain anyway
//  * @returns {Array}
//  */
function getBareERC20Abi() {
    return [
        {
            inputs: [
                { internalType: "address", name: "account", type: "address" },
                { internalType: "address", name: "minter_", type: "address" },
                {
                    internalType: "uint256",
                    name: "mintingAllowedAfter_",
                    type: "uint256",
                },
            ],
            payable: false,
            stateMutability: "nonpayable",
            type: "constructor",
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: true,
                    internalType: "address",
                    name: "owner",
                    type: "address",
                },
                {
                    indexed: true,
                    internalType: "address",
                    name: "spender",
                    type: "address",
                },
                {
                    indexed: false,
                    internalType: "uint256",
                    name: "amount",
                    type: "uint256",
                },
            ],
            name: "Approval",
            type: "event",
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: true,
                    internalType: "address",
                    name: "delegator",
                    type: "address",
                },
                {
                    indexed: true,
                    internalType: "address",
                    name: "fromDelegate",
                    type: "address",
                },
                {
                    indexed: true,
                    internalType: "address",
                    name: "toDelegate",
                    type: "address",
                },
            ],
            name: "DelegateChanged",
            type: "event",
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: true,
                    internalType: "address",
                    name: "delegate",
                    type: "address",
                },
                {
                    indexed: false,
                    internalType: "uint256",
                    name: "previousBalance",
                    type: "uint256",
                },
                {
                    indexed: false,
                    internalType: "uint256",
                    name: "newBalance",
                    type: "uint256",
                },
            ],
            name: "DelegateVotesChanged",
            type: "event",
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: "address",
                    name: "minter",
                    type: "address",
                },
                {
                    indexed: false,
                    internalType: "address",
                    name: "newMinter",
                    type: "address",
                },
            ],
            name: "MinterChanged",
            type: "event",
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: true,
                    internalType: "address",
                    name: "from",
                    type: "address",
                },
                { indexed: true, internalType: "address", name: "to", type: "address" },
                {
                    indexed: false,
                    internalType: "uint256",
                    name: "amount",
                    type: "uint256",
                },
            ],
            name: "Transfer",
            type: "event",
        },
        {
            constant: true,
            inputs: [],
            name: "DELEGATION_TYPEHASH",
            outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
            payable: false,
            stateMutability: "view",
            type: "function",
        },
        {
            constant: true,
            inputs: [],
            name: "DOMAIN_TYPEHASH",
            outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
            payable: false,
            stateMutability: "view",
            type: "function",
        },
        {
            constant: true,
            inputs: [],
            name: "PERMIT_TYPEHASH",
            outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
            payable: false,
            stateMutability: "view",
            type: "function",
        },
        {
            constant: true,
            inputs: [
                { internalType: "address", name: "account", type: "address" },
                { internalType: "address", name: "spender", type: "address" },
            ],
            name: "allowance",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            payable: false,
            stateMutability: "view",
            type: "function",
        },
        {
            constant: false,
            inputs: [
                { internalType: "address", name: "spender", type: "address" },
                { internalType: "uint256", name: "rawAmount", type: "uint256" },
            ],
            name: "approve",
            outputs: [{ internalType: "bool", name: "", type: "bool" }],
            payable: false,
            stateMutability: "nonpayable",
            type: "function",
        },
        {
            constant: true,
            inputs: [{ internalType: "address", name: "account", type: "address" }],
            name: "balanceOf",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            payable: false,
            stateMutability: "view",
            type: "function",
        },
        {
            constant: true,
            inputs: [
                { internalType: "address", name: "", type: "address" },
                { internalType: "uint32", name: "", type: "uint32" },
            ],
            name: "checkpoints",
            outputs: [
                { internalType: "uint32", name: "fromBlock", type: "uint32" },
                { internalType: "uint96", name: "votes", type: "uint96" },
            ],
            payable: false,
            stateMutability: "view",
            type: "function",
        },
        {
            constant: true,
            inputs: [],
            name: "decimals",
            outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
            payable: false,
            stateMutability: "view",
            type: "function",
        },
        {
            constant: false,
            inputs: [{ internalType: "address", name: "delegatee", type: "address" }],
            name: "delegate",
            outputs: [],
            payable: false,
            stateMutability: "nonpayable",
            type: "function",
        },
        {
            constant: false,
            inputs: [
                { internalType: "address", name: "delegatee", type: "address" },
                { internalType: "uint256", name: "nonce", type: "uint256" },
                { internalType: "uint256", name: "expiry", type: "uint256" },
                { internalType: "uint8", name: "v", type: "uint8" },
                { internalType: "bytes32", name: "r", type: "bytes32" },
                { internalType: "bytes32", name: "s", type: "bytes32" },
            ],
            name: "delegateBySig",
            outputs: [],
            payable: false,
            stateMutability: "nonpayable",
            type: "function",
        },
        {
            constant: true,
            inputs: [{ internalType: "address", name: "", type: "address" }],
            name: "delegates",
            outputs: [{ internalType: "address", name: "", type: "address" }],
            payable: false,
            stateMutability: "view",
            type: "function",
        },
        {
            constant: true,
            inputs: [{ internalType: "address", name: "account", type: "address" }],
            name: "getCurrentVotes",
            outputs: [{ internalType: "uint96", name: "", type: "uint96" }],
            payable: false,
            stateMutability: "view",
            type: "function",
        },
        {
            constant: true,
            inputs: [
                { internalType: "address", name: "account", type: "address" },
                { internalType: "uint256", name: "blockNumber", type: "uint256" },
            ],
            name: "getPriorVotes",
            outputs: [{ internalType: "uint96", name: "", type: "uint96" }],
            payable: false,
            stateMutability: "view",
            type: "function",
        },
        {
            constant: true,
            inputs: [],
            name: "minimumTimeBetweenMints",
            outputs: [{ internalType: "uint32", name: "", type: "uint32" }],
            payable: false,
            stateMutability: "view",
            type: "function",
        },
        {
            constant: false,
            inputs: [
                { internalType: "address", name: "dst", type: "address" },
                { internalType: "uint256", name: "rawAmount", type: "uint256" },
            ],
            name: "mint",
            outputs: [],
            payable: false,
            stateMutability: "nonpayable",
            type: "function",
        },
        {
            constant: true,
            inputs: [],
            name: "mintCap",
            outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
            payable: false,
            stateMutability: "view",
            type: "function",
        },
        {
            constant: true,
            inputs: [],
            name: "minter",
            outputs: [{ internalType: "address", name: "", type: "address" }],
            payable: false,
            stateMutability: "view",
            type: "function",
        },
        {
            constant: true,
            inputs: [],
            name: "mintingAllowedAfter",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            payable: false,
            stateMutability: "view",
            type: "function",
        },
        {
            constant: true,
            inputs: [],
            name: "name",
            outputs: [{ internalType: "string", name: "", type: "string" }],
            payable: false,
            stateMutability: "view",
            type: "function",
        },
        {
            constant: true,
            inputs: [{ internalType: "address", name: "", type: "address" }],
            name: "nonces",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            payable: false,
            stateMutability: "view",
            type: "function",
        },
        {
            constant: true,
            inputs: [{ internalType: "address", name: "", type: "address" }],
            name: "numCheckpoints",
            outputs: [{ internalType: "uint32", name: "", type: "uint32" }],
            payable: false,
            stateMutability: "view",
            type: "function",
        },
        {
            constant: false,
            inputs: [
                { internalType: "address", name: "owner", type: "address" },
                { internalType: "address", name: "spender", type: "address" },
                { internalType: "uint256", name: "rawAmount", type: "uint256" },
                { internalType: "uint256", name: "deadline", type: "uint256" },
                { internalType: "uint8", name: "v", type: "uint8" },
                { internalType: "bytes32", name: "r", type: "bytes32" },
                { internalType: "bytes32", name: "s", type: "bytes32" },
            ],
            name: "permit",
            outputs: [],
            payable: false,
            stateMutability: "nonpayable",
            type: "function",
        },
        {
            constant: false,
            inputs: [{ internalType: "address", name: "minter_", type: "address" }],
            name: "setMinter",
            outputs: [],
            payable: false,
            stateMutability: "nonpayable",
            type: "function",
        },
        {
            constant: true,
            inputs: [],
            name: "symbol",
            outputs: [{ internalType: "string", name: "", type: "string" }],
            payable: false,
            stateMutability: "view",
            type: "function",
        },
        {
            constant: true,
            inputs: [],
            name: "totalSupply",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            payable: false,
            stateMutability: "view",
            type: "function",
        },
        {
            constant: false,
            inputs: [
                { internalType: "address", name: "dst", type: "address" },
                { internalType: "uint256", name: "rawAmount", type: "uint256" },
            ],
            name: "transfer",
            outputs: [{ internalType: "bool", name: "", type: "bool" }],
            payable: false,
            stateMutability: "nonpayable",
            type: "function",
        },
        {
            constant: false,
            inputs: [
                { internalType: "address", name: "src", type: "address" },
                { internalType: "address", name: "dst", type: "address" },
                { internalType: "uint256", name: "rawAmount", type: "uint256" },
            ],
            name: "transferFrom",
            outputs: [{ internalType: "bool", name: "", type: "bool" }],
            payable: false,
            stateMutability: "nonpayable",
            type: "function",
        },
    ];
}
exports.getBareERC20Abi = getBareERC20Abi;
function getMasterChefAbi() {
    return [
        {
            inputs: [
                {
                    internalType: "contract IMasterChef",
                    name: "_MASTER_CHEF",
                    type: "address",
                },
                { internalType: "contract IERC20", name: "_sushi", type: "address" },
                { internalType: "uint256", name: "_MASTER_PID", type: "uint256" },
            ],
            stateMutability: "nonpayable",
            type: "constructor",
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: true,
                    internalType: "address",
                    name: "user",
                    type: "address",
                },
                {
                    indexed: true,
                    internalType: "uint256",
                    name: "pid",
                    type: "uint256",
                },
                {
                    indexed: false,
                    internalType: "uint256",
                    name: "amount",
                    type: "uint256",
                },
                { indexed: true, internalType: "address", name: "to", type: "address" },
            ],
            name: "Deposit",
            type: "event",
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: true,
                    internalType: "address",
                    name: "user",
                    type: "address",
                },
                {
                    indexed: true,
                    internalType: "uint256",
                    name: "pid",
                    type: "uint256",
                },
                {
                    indexed: false,
                    internalType: "uint256",
                    name: "amount",
                    type: "uint256",
                },
                { indexed: true, internalType: "address", name: "to", type: "address" },
            ],
            name: "EmergencyWithdraw",
            type: "event",
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: true,
                    internalType: "address",
                    name: "user",
                    type: "address",
                },
                {
                    indexed: true,
                    internalType: "uint256",
                    name: "pid",
                    type: "uint256",
                },
                {
                    indexed: false,
                    internalType: "uint256",
                    name: "amount",
                    type: "uint256",
                },
            ],
            name: "Harvest",
            type: "event",
        },
        { anonymous: false, inputs: [], name: "LogInit", type: "event" },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: true,
                    internalType: "uint256",
                    name: "pid",
                    type: "uint256",
                },
                {
                    indexed: false,
                    internalType: "uint256",
                    name: "allocPoint",
                    type: "uint256",
                },
                {
                    indexed: true,
                    internalType: "contract IERC20",
                    name: "lpToken",
                    type: "address",
                },
                {
                    indexed: true,
                    internalType: "contract IRewarder",
                    name: "rewarder",
                    type: "address",
                },
            ],
            name: "LogPoolAddition",
            type: "event",
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: true,
                    internalType: "uint256",
                    name: "pid",
                    type: "uint256",
                },
                {
                    indexed: false,
                    internalType: "uint256",
                    name: "allocPoint",
                    type: "uint256",
                },
                {
                    indexed: true,
                    internalType: "contract IRewarder",
                    name: "rewarder",
                    type: "address",
                },
                {
                    indexed: false,
                    internalType: "bool",
                    name: "overwrite",
                    type: "bool",
                },
            ],
            name: "LogSetPool",
            type: "event",
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: true,
                    internalType: "uint256",
                    name: "pid",
                    type: "uint256",
                },
                {
                    indexed: false,
                    internalType: "uint64",
                    name: "lastRewardBlock",
                    type: "uint64",
                },
                {
                    indexed: false,
                    internalType: "uint256",
                    name: "lpSupply",
                    type: "uint256",
                },
                {
                    indexed: false,
                    internalType: "uint256",
                    name: "accSushiPerShare",
                    type: "uint256",
                },
            ],
            name: "LogUpdatePool",
            type: "event",
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: true,
                    internalType: "address",
                    name: "previousOwner",
                    type: "address",
                },
                {
                    indexed: true,
                    internalType: "address",
                    name: "newOwner",
                    type: "address",
                },
            ],
            name: "OwnershipTransferred",
            type: "event",
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: true,
                    internalType: "address",
                    name: "user",
                    type: "address",
                },
                {
                    indexed: true,
                    internalType: "uint256",
                    name: "pid",
                    type: "uint256",
                },
                {
                    indexed: false,
                    internalType: "uint256",
                    name: "amount",
                    type: "uint256",
                },
                { indexed: true, internalType: "address", name: "to", type: "address" },
            ],
            name: "Withdraw",
            type: "event",
        },
        {
            inputs: [],
            name: "MASTER_CHEF",
            outputs: [
                { internalType: "contract IMasterChef", name: "", type: "address" },
            ],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "MASTER_PID",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "SUSHI",
            outputs: [{ internalType: "contract IERC20", name: "", type: "address" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [
                { internalType: "uint256", name: "allocPoint", type: "uint256" },
                { internalType: "contract IERC20", name: "_lpToken", type: "address" },
                {
                    internalType: "contract IRewarder",
                    name: "_rewarder",
                    type: "address",
                },
            ],
            name: "add",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
        },
        {
            inputs: [
                { internalType: "bytes[]", name: "calls", type: "bytes[]" },
                { internalType: "bool", name: "revertOnFail", type: "bool" },
            ],
            name: "batch",
            outputs: [
                { internalType: "bool[]", name: "successes", type: "bool[]" },
                { internalType: "bytes[]", name: "results", type: "bytes[]" },
            ],
            stateMutability: "payable",
            type: "function",
        },
        {
            inputs: [],
            name: "claimOwnership",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
        },
        {
            inputs: [
                { internalType: "uint256", name: "pid", type: "uint256" },
                { internalType: "uint256", name: "amount", type: "uint256" },
                { internalType: "address", name: "to", type: "address" },
            ],
            name: "deposit",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
        },
        {
            inputs: [
                { internalType: "uint256", name: "pid", type: "uint256" },
                { internalType: "address", name: "to", type: "address" },
            ],
            name: "emergencyWithdraw",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
        },
        {
            inputs: [
                { internalType: "uint256", name: "pid", type: "uint256" },
                { internalType: "address", name: "to", type: "address" },
            ],
            name: "harvest",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
        },
        {
            inputs: [],
            name: "harvestFromMasterChef",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
        },
        {
            inputs: [
                {
                    internalType: "contract IERC20",
                    name: "dummyToken",
                    type: "address",
                },
            ],
            name: "init",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
        },
        {
            inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            name: "lpToken",
            outputs: [{ internalType: "contract IERC20", name: "", type: "address" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [{ internalType: "uint256[]", name: "pids", type: "uint256[]" }],
            name: "massUpdatePools",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
        },
        {
            inputs: [{ internalType: "uint256", name: "_pid", type: "uint256" }],
            name: "migrate",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
        },
        {
            inputs: [],
            name: "migrator",
            outputs: [
                { internalType: "contract IMigratorChef", name: "", type: "address" },
            ],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "owner",
            outputs: [{ internalType: "address", name: "", type: "address" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "pendingOwner",
            outputs: [{ internalType: "address", name: "", type: "address" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [
                { internalType: "uint256", name: "_pid", type: "uint256" },
                { internalType: "address", name: "_user", type: "address" },
            ],
            name: "pendingSushi",
            outputs: [{ internalType: "uint256", name: "pending", type: "uint256" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [
                { internalType: "contract IERC20", name: "token", type: "address" },
                { internalType: "address", name: "from", type: "address" },
                { internalType: "address", name: "to", type: "address" },
                { internalType: "uint256", name: "amount", type: "uint256" },
                { internalType: "uint256", name: "deadline", type: "uint256" },
                { internalType: "uint8", name: "v", type: "uint8" },
                { internalType: "bytes32", name: "r", type: "bytes32" },
                { internalType: "bytes32", name: "s", type: "bytes32" },
            ],
            name: "permitToken",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
        },
        {
            inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            name: "poolInfo",
            outputs: [
                { internalType: "uint128", name: "accSushiPerShare", type: "uint128" },
                { internalType: "uint64", name: "lastRewardBlock", type: "uint64" },
                { internalType: "uint64", name: "allocPoint", type: "uint64" },
            ],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "poolLength",
            outputs: [{ internalType: "uint256", name: "pools", type: "uint256" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            name: "rewarder",
            outputs: [
                { internalType: "contract IRewarder", name: "", type: "address" },
            ],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [
                { internalType: "uint256", name: "_pid", type: "uint256" },
                { internalType: "uint256", name: "_allocPoint", type: "uint256" },
                {
                    internalType: "contract IRewarder",
                    name: "_rewarder",
                    type: "address",
                },
                { internalType: "bool", name: "overwrite", type: "bool" },
            ],
            name: "set",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
        },
        {
            inputs: [
                {
                    internalType: "contract IMigratorChef",
                    name: "_migrator",
                    type: "address",
                },
            ],
            name: "setMigrator",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
        },
        {
            inputs: [],
            name: "sushiPerBlock",
            outputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "totalAllocPoint",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [
                { internalType: "address", name: "newOwner", type: "address" },
                { internalType: "bool", name: "direct", type: "bool" },
                { internalType: "bool", name: "renounce", type: "bool" },
            ],
            name: "transferOwnership",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
        },
        {
            inputs: [{ internalType: "uint256", name: "pid", type: "uint256" }],
            name: "updatePool",
            outputs: [
                {
                    components: [
                        {
                            internalType: "uint128",
                            name: "accSushiPerShare",
                            type: "uint128",
                        },
                        { internalType: "uint64", name: "lastRewardBlock", type: "uint64" },
                        { internalType: "uint64", name: "allocPoint", type: "uint64" },
                    ],
                    internalType: "struct MasterChefV2.PoolInfo",
                    name: "pool",
                    type: "tuple",
                },
            ],
            stateMutability: "nonpayable",
            type: "function",
        },
        {
            inputs: [
                { internalType: "uint256", name: "", type: "uint256" },
                { internalType: "address", name: "", type: "address" },
            ],
            name: "userInfo",
            outputs: [
                { internalType: "uint256", name: "amount", type: "uint256" },
                { internalType: "int256", name: "rewardDebt", type: "int256" },
            ],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [
                { internalType: "uint256", name: "pid", type: "uint256" },
                { internalType: "uint256", name: "amount", type: "uint256" },
                { internalType: "address", name: "to", type: "address" },
            ],
            name: "withdraw",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
        },
        {
            inputs: [
                { internalType: "uint256", name: "pid", type: "uint256" },
                { internalType: "uint256", name: "amount", type: "uint256" },
                { internalType: "address", name: "to", type: "address" },
            ],
            name: "withdrawAndHarvest",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
        },
    ];
}
exports.getMasterChefAbi = getMasterChefAbi;
function getValidatorSetABI() {
    return [
        {
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: "uint256",
                    name: "amount",
                    type: "uint256",
                },
            ],
            name: "batchTransfer",
            type: "event",
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: true,
                    internalType: "uint256",
                    name: "amount",
                    type: "uint256",
                },
                {
                    indexed: false,
                    internalType: "string",
                    name: "reason",
                    type: "string",
                },
            ],
            name: "batchTransferFailed",
            type: "event",
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: true,
                    internalType: "uint256",
                    name: "amount",
                    type: "uint256",
                },
                {
                    indexed: false,
                    internalType: "bytes",
                    name: "reason",
                    type: "bytes",
                },
            ],
            name: "batchTransferLowerFailed",
            type: "event",
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: true,
                    internalType: "address",
                    name: "validator",
                    type: "address",
                },
                {
                    indexed: false,
                    internalType: "uint256",
                    name: "amount",
                    type: "uint256",
                },
            ],
            name: "deprecatedDeposit",
            type: "event",
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: true,
                    internalType: "addresspayable",
                    name: "validator",
                    type: "address",
                },
                {
                    indexed: false,
                    internalType: "uint256",
                    name: "amount",
                    type: "uint256",
                },
            ],
            name: "directTransfer",
            type: "event",
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: true,
                    internalType: "addresspayable",
                    name: "validator",
                    type: "address",
                },
                {
                    indexed: false,
                    internalType: "uint256",
                    name: "amount",
                    type: "uint256",
                },
            ],
            name: "directTransferFail",
            type: "event",
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: "string",
                    name: "message",
                    type: "string",
                },
            ],
            name: "failReasonWithStr",
            type: "event",
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: "uint256",
                    name: "amount",
                    type: "uint256",
                },
            ],
            name: "feeBurned",
            type: "event",
        },
        {
            anonymous: false,
            inputs: [
                { indexed: false, internalType: "string", name: "key", type: "string" },
                { indexed: false, internalType: "bytes", name: "value", type: "bytes" },
            ],
            name: "paramChange",
            type: "event",
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: "uint256",
                    name: "amount",
                    type: "uint256",
                },
            ],
            name: "systemTransfer",
            type: "event",
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: "uint8",
                    name: "channelId",
                    type: "uint8",
                },
                {
                    indexed: false,
                    internalType: "bytes",
                    name: "msgBytes",
                    type: "bytes",
                },
            ],
            name: "unexpectedPackage",
            type: "event",
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: true,
                    internalType: "address",
                    name: "validator",
                    type: "address",
                },
                {
                    indexed: false,
                    internalType: "uint256",
                    name: "amount",
                    type: "uint256",
                },
            ],
            name: "validatorDeposit",
            type: "event",
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: true,
                    internalType: "address",
                    name: "validator",
                    type: "address",
                },
            ],
            name: "validatorEmptyJailed",
            type: "event",
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: true,
                    internalType: "address",
                    name: "validator",
                    type: "address",
                },
            ],
            name: "validatorEnterMaintenance",
            type: "event",
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: true,
                    internalType: "address",
                    name: "validator",
                    type: "address",
                },
            ],
            name: "validatorExitMaintenance",
            type: "event",
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: true,
                    internalType: "address",
                    name: "validator",
                    type: "address",
                },
                {
                    indexed: false,
                    internalType: "uint256",
                    name: "amount",
                    type: "uint256",
                },
            ],
            name: "validatorFelony",
            type: "event",
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: true,
                    internalType: "address",
                    name: "validator",
                    type: "address",
                },
            ],
            name: "validatorJailed",
            type: "event",
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: true,
                    internalType: "address",
                    name: "validator",
                    type: "address",
                },
                {
                    indexed: false,
                    internalType: "uint256",
                    name: "amount",
                    type: "uint256",
                },
            ],
            name: "validatorMisdemeanor",
            type: "event",
        },
        {
            anonymous: false,
            inputs: [],
            name: "validatorSetUpdated",
            type: "event",
        },
        {
            inputs: [],
            name: "BIND_CHANNELID",
            outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "BURN_ADDRESS",
            outputs: [{ internalType: "address", name: "", type: "address" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "BURN_RATIO_SCALE",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "CODE_OK",
            outputs: [{ internalType: "uint32", name: "", type: "uint32" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "CROSS_CHAIN_CONTRACT_ADDR",
            outputs: [{ internalType: "address", name: "", type: "address" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "DUSTY_INCOMING",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "EPOCH",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "ERROR_FAIL_CHECK_VALIDATORS",
            outputs: [{ internalType: "uint32", name: "", type: "uint32" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "ERROR_FAIL_DECODE",
            outputs: [{ internalType: "uint32", name: "", type: "uint32" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "ERROR_LEN_OF_VAL_MISMATCH",
            outputs: [{ internalType: "uint32", name: "", type: "uint32" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "ERROR_RELAYFEE_TOO_LARGE",
            outputs: [{ internalType: "uint32", name: "", type: "uint32" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "ERROR_UNKNOWN_PACKAGE_TYPE",
            outputs: [{ internalType: "uint32", name: "", type: "uint32" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "EXPIRE_TIME_SECOND_GAP",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "GOV_CHANNELID",
            outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "GOV_HUB_ADDR",
            outputs: [{ internalType: "address", name: "", type: "address" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "INCENTIVIZE_ADDR",
            outputs: [{ internalType: "address", name: "", type: "address" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "INIT_BURN_RATIO",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "INIT_MAINTAIN_SLASH_SCALE",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "INIT_MAX_NUM_OF_MAINTAINING",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "INIT_NUM_OF_CABINETS",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "INIT_VALIDATORSET_BYTES",
            outputs: [{ internalType: "bytes", name: "", type: "bytes" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "JAIL_MESSAGE_TYPE",
            outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "LIGHT_CLIENT_ADDR",
            outputs: [{ internalType: "address", name: "", type: "address" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "MAX_NUM_OF_VALIDATORS",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "PRECISION",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "RELAYERHUB_CONTRACT_ADDR",
            outputs: [{ internalType: "address", name: "", type: "address" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "SLASH_CHANNELID",
            outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "SLASH_CONTRACT_ADDR",
            outputs: [{ internalType: "address", name: "", type: "address" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "STAKING_CHANNELID",
            outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "SYSTEM_REWARD_ADDR",
            outputs: [{ internalType: "address", name: "", type: "address" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "TOKEN_HUB_ADDR",
            outputs: [{ internalType: "address", name: "", type: "address" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "TOKEN_MANAGER_ADDR",
            outputs: [{ internalType: "address", name: "", type: "address" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "TRANSFER_IN_CHANNELID",
            outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "TRANSFER_OUT_CHANNELID",
            outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "VALIDATORS_UPDATE_MESSAGE_TYPE",
            outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "VALIDATOR_CONTRACT_ADDR",
            outputs: [{ internalType: "address", name: "", type: "address" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "alreadyInit",
            outputs: [{ internalType: "bool", name: "", type: "bool" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "bscChainID",
            outputs: [{ internalType: "uint16", name: "", type: "uint16" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "burnRatio",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "burnRatioInitialized",
            outputs: [{ internalType: "bool", name: "", type: "bool" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [{ internalType: "uint256", name: "index", type: "uint256" }],
            name: "canEnterMaintenance",
            outputs: [{ internalType: "bool", name: "", type: "bool" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            name: "currentValidatorSet",
            outputs: [
                { internalType: "address", name: "consensusAddress", type: "address" },
                { internalType: "addresspayable", name: "feeAddress", type: "address" },
                { internalType: "address", name: "BBCFeeAddress", type: "address" },
                { internalType: "uint64", name: "votingPower", type: "uint64" },
                { internalType: "bool", name: "jailed", type: "bool" },
                { internalType: "uint256", name: "incoming", type: "uint256" },
            ],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [{ internalType: "address", name: "", type: "address" }],
            name: "currentValidatorSetMap",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [{ internalType: "address", name: "valAddr", type: "address" }],
            name: "deposit",
            outputs: [],
            stateMutability: "payable",
            type: "function",
        },
        {
            inputs: [],
            name: "enterMaintenance",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
        },
        {
            inputs: [],
            name: "exitMaintenance",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
        },
        {
            inputs: [],
            name: "expireTimeSecondGap",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [{ internalType: "address", name: "validator", type: "address" }],
            name: "felony",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
        },
        {
            inputs: [
                { internalType: "address", name: "_validator", type: "address" },
            ],
            name: "getCurrentValidatorIndex",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [{ internalType: "address", name: "validator", type: "address" }],
            name: "getIncoming",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "getMiningValidators",
            outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "getValidators",
            outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "getWorkingValidatorCount",
            outputs: [
                {
                    internalType: "uint256",
                    name: "workingValidatorCount",
                    type: "uint256",
                },
            ],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [
                { internalType: "uint8", name: "channelId", type: "uint8" },
                { internalType: "bytes", name: "msgBytes", type: "bytes" },
            ],
            name: "handleAckPackage",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
        },
        {
            inputs: [
                { internalType: "uint8", name: "channelId", type: "uint8" },
                { internalType: "bytes", name: "msgBytes", type: "bytes" },
            ],
            name: "handleFailAckPackage",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
        },
        {
            inputs: [
                { internalType: "uint8", name: "", type: "uint8" },
                { internalType: "bytes", name: "msgBytes", type: "bytes" },
            ],
            name: "handleSynPackage",
            outputs: [
                { internalType: "bytes", name: "responsePayload", type: "bytes" },
            ],
            stateMutability: "nonpayable",
            type: "function",
        },
        {
            inputs: [],
            name: "init",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
        },
        {
            inputs: [{ internalType: "address", name: "validator", type: "address" }],
            name: "isCurrentValidator",
            outputs: [{ internalType: "bool", name: "", type: "bool" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [{ internalType: "uint256", name: "index", type: "uint256" }],
            name: "isWorkingValidator",
            outputs: [{ internalType: "bool", name: "", type: "bool" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "maintainSlashScale",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "maxNumOfCandidates",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "maxNumOfMaintaining",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "maxNumOfWorkingCandidates",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [{ internalType: "address", name: "validator", type: "address" }],
            name: "misdemeanor",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
        },
        {
            inputs: [],
            name: "numOfCabinets",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "numOfJailed",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "numOfMaintaining",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "totalInComing",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [
                { internalType: "string", name: "key", type: "string" },
                { internalType: "bytes", name: "value", type: "bytes" },
            ],
            name: "updateParam",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
        },
        {
            inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            name: "validatorExtraSet",
            outputs: [
                {
                    internalType: "uint256",
                    name: "enterMaintenanceHeight",
                    type: "uint256",
                },
                { internalType: "bool", name: "isMaintaining", type: "bool" },
            ],
            stateMutability: "view",
            type: "function",
        },
    ];
}
exports.getValidatorSetABI = getValidatorSetABI;
