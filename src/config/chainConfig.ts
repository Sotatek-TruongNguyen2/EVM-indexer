//@ts-ignore
import { ethers } from 'ethers';
import { ChainId } from '../common/chainId';
import { Networks } from './networks';
import { ChainsConfig } from '../types';
import { getIndexerLogger } from '../utils/logger';

let logger = getIndexerLogger('chainConfig');

let _PROVIDER_CACHE: { [network: ChainId]: ethers.providers.JsonRpcProvider } =
  {};
let _TOKEN_CONTRACT_CACHE = {};

const ChainConfig: ChainsConfig = {
  [ChainId.ETH]: {
    id: ChainId.ETH,
    name: Networks.ETH.name,
    rpc: () => process.env.ETH_RPC,
    contract: '0xef0881ec094552b2e128cf945ef17a6752b4ec5d',
    startBlock: 16705275, // Block to backindex until
    oldestBlock: 16692732, // Start indexing older txns from here until startblock
    // tokens: buildTokenInfo(ChainId.ETH),
  },
  // [ChainId.BSC]: {
  //   id: ChainId.BSC,
  //   name: Networks.BSC.name,
  //   rpc: () => process.env.BSC_RPC,
  //   bridge: '0xd123f70ae324d34a9e76b67a27bf77593ba8749f',
  //   startBlock: 17792524,
  //   oldestBlock: 10087779,
  //   // tokens: buildTokenInfo(ChainId.BSC),
  // },
  // [ChainId.ARBITRUM]: {
  //   id: ChainId.ARBITRUM,
  //   name: Networks.ARBITRUM.name,
  //   rpc: () => process.env.ARB_RPC,
  //   bridge: '0x6f4e8eba4d337f874ab57478acc2cb5bacdc19c9',
  //   startBlock: 12058508,
  //   oldestBlock: 748263,
  //   // tokens: buildTokenInfo(ChainId.ARBITRUM),
  // },
  // [ChainId.AVALANCHE]: {
  //   id: ChainId.AVALANCHE,
  //   name: Networks.AVALANCHE.name,
  //   rpc: () => process.env.AVAX_RPC,
  //   bridge: '0xc05e61d0e7a63d27546389b7ad62fdff5a91aace',
  //   startBlock: 14664267,
  //   oldestBlock: 3427948,
  //   // tokens: buildTokenInfo(ChainId.AVALANCHE),
  // },
  // [ChainId.POLYGON]: {
  //   id: ChainId.POLYGON,
  //   name: Networks.POLYGON.name,
  //   rpc: () => process.env.POLYGON_RPC,
  //   bridge: '0x8f5bbb2bb8c2ee94639e55d5f41de9b4839c1280',
  //   startBlock: 28318916,
  //   oldestBlock: 18059138,
  //   // tokens: buildTokenInfo(ChainId.POLYGON),
  // },
  // [ChainId.FANTOM]: {
  //   id: ChainId.FANTOM,
  //   name: Networks.FANTOM.name,
  //   rpc: () => process.env.FTM_RPC,
  //   bridge: '0xaf41a65f786339e7911f4acdad6bd49426f2dc6b',
  //   startBlock: 38182430,
  //   oldestBlock: 18537414,
  //   // tokens: buildTokenInfo(ChainId.FANTOM),
  // },
  // [ChainId.HARMONY]: {
  //   id: ChainId.HARMONY,
  //   name: Networks.HARMONY.name,
  //   rpc: () => process.env.HARMONY_RPC,
  //   bridge: '0xaf41a65f786339e7911f4acdad6bd49426f2dc6b',
  //   startBlock: 19163634,
  //   oldestBlock: 18936014,
  //   // tokens: buildTokenInfo(ChainId.HARMONY),
  // },
  // [ChainId.BOBA]: {
  //   id: ChainId.BOBA,
  //   name: Networks.BOBA.name,
  //   rpc: () => process.env.BOBA_RPC,
  //   bridge: '0x432036208d2717394d2614d6697c46df3ed69540',
  //   startBlock: 599462,
  //   // tokens: buildTokenInfo(ChainId.BOBA),
  // },
  // [ChainId.MOONRIVER]: {
  //   id: ChainId.MOONRIVER,
  //   name: Networks.MOONRIVER.name,
  //   rpc: () => process.env.MOVR_RPC,
  //   bridge: '0xaed5b25be1c3163c907a471082640450f928ddfe',
  //   startBlock: 1815083,
  //   // tokens: buildTokenInfo(ChainId.MOONRIVER),
  // },
  // [ChainId.OPTIMISM]: {
  //   id: ChainId.OPTIMISM,
  //   name: Networks.OPTIMISM.name,
  //   rpc: () => process.env.OPTIMISM_RPC,
  //   bridge: '0xaf41a65f786339e7911f4acdad6bd49426f2dc6b',
  //   startBlock: 8242073,
  //   // tokens: buildTokenInfo(ChainId.OPTIMISM),
  // },
  // [ChainId.AURORA]: {
  //   id: ChainId.AURORA,
  //   name: Networks.AURORA.name,
  //   rpc: () => process.env.AURORA_RPC,
  //   bridge: '0xaed5b25be1c3163c907a471082640450f928ddfe',
  //   startBlock: 65578362,
  //   // tokens: buildTokenInfo(ChainId.AURORA),
  // },
  // [ChainId.MOONBEAM]: {
  //   id: ChainId.MOONBEAM,
  //   name: Networks.MOONBEAM.name,
  //   rpc: () => process.env.MOONBEAM_RPC,
  //   bridge: '0x84a420459cd31c3c34583f67e0f0fb191067d32f',
  //   startBlock: 1021561,
  //   // tokens: buildTokenInfo(ChainId.MOONBEAM),
  // },
  // [ChainId.CRONOS]: {
  //   id: ChainId.CRONOS,
  //   name: Networks.CRONOS.name,
  //   rpc: () => process.env.CRONOS_RPC,
  //   bridge: '0xe27bff97ce92c3e1ff7aa9f86781fdd6d48f5ee9',
  //   startBlock: 1578335,
  //   // tokens: buildTokenInfo(ChainId.CRONOS),
  // },
  // [ChainId.METIS]: {
  //   id: ChainId.METIS,
  //   name: Networks.METIS.name,
  //   rpc: () => process.env.METIS_RPC,
  //   bridge: '0x06fea8513ff03a0d3f61324da709d4cf06f42a5c',
  //   startBlock: 2655606,
  //   // tokens: buildTokenInfo(ChainId.METIS),
  // },
  // [ChainId.DFK]: {
  //   id: ChainId.DFK,
  //   name: Networks.DFK.name,
  //   rpc: () => process.env.DFK_RPC,
  //   bridge: '0xe05c976d3f045d0e6e7a6f61083d98a15603cf6a',
  //   startBlock: 0,
  //   tokens: buildTokenInfo(ChainId.DFK),
  // },
  // [ChainId.KLAYTN]: {
  //   id: ChainId.KLAYTN,
  //   name: Networks.KLAYTN.name,
  //   rpc: () => process.env.KLAYTN_RPC,
  //   bridge: '0xAf41a65F786339e7911F4acDAD6BD49426F2Dc6b',
  //   startBlock: 93801362,
  //   tokens: buildTokenInfo(ChainId.KLAYTN),
  // },
};

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
function getRPCProvider(chainId: ChainId) {
  if (!_PROVIDER_CACHE[chainId]) {
    console.log('ChainConfig[chainId].rpc()', ChainConfig[chainId].rpc());
    _PROVIDER_CACHE[chainId] = new ethers.providers.JsonRpcProvider(
      ChainConfig[chainId].rpc(),
    );
  }

  return _PROVIDER_CACHE[chainId];
}

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
function buildTokenContract(
  contractAddress: string,
  abi: ethers.ContractInterface,
  provider: ethers.providers.JsonRpcProvider,
) {
  return new ethers.Contract(contractAddress, abi, provider);
}

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
        { internalType: 'address', name: 'account', type: 'address' },
        { internalType: 'address', name: 'minter_', type: 'address' },
        {
          internalType: 'uint256',
          name: 'mintingAllowedAfter_',
          type: 'uint256',
        },
      ],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'constructor',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'owner',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'spender',
          type: 'address',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'amount',
          type: 'uint256',
        },
      ],
      name: 'Approval',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'delegator',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'fromDelegate',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'toDelegate',
          type: 'address',
        },
      ],
      name: 'DelegateChanged',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'delegate',
          type: 'address',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'previousBalance',
          type: 'uint256',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'newBalance',
          type: 'uint256',
        },
      ],
      name: 'DelegateVotesChanged',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: 'address',
          name: 'minter',
          type: 'address',
        },
        {
          indexed: false,
          internalType: 'address',
          name: 'newMinter',
          type: 'address',
        },
      ],
      name: 'MinterChanged',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'from',
          type: 'address',
        },
        { indexed: true, internalType: 'address', name: 'to', type: 'address' },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'amount',
          type: 'uint256',
        },
      ],
      name: 'Transfer',
      type: 'event',
    },
    {
      constant: true,
      inputs: [],
      name: 'DELEGATION_TYPEHASH',
      outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: true,
      inputs: [],
      name: 'DOMAIN_TYPEHASH',
      outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: true,
      inputs: [],
      name: 'PERMIT_TYPEHASH',
      outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: true,
      inputs: [
        { internalType: 'address', name: 'account', type: 'address' },
        { internalType: 'address', name: 'spender', type: 'address' },
      ],
      name: 'allowance',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: false,
      inputs: [
        { internalType: 'address', name: 'spender', type: 'address' },
        { internalType: 'uint256', name: 'rawAmount', type: 'uint256' },
      ],
      name: 'approve',
      outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      constant: true,
      inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
      name: 'balanceOf',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: true,
      inputs: [
        { internalType: 'address', name: '', type: 'address' },
        { internalType: 'uint32', name: '', type: 'uint32' },
      ],
      name: 'checkpoints',
      outputs: [
        { internalType: 'uint32', name: 'fromBlock', type: 'uint32' },
        { internalType: 'uint96', name: 'votes', type: 'uint96' },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: true,
      inputs: [],
      name: 'decimals',
      outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: false,
      inputs: [{ internalType: 'address', name: 'delegatee', type: 'address' }],
      name: 'delegate',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      constant: false,
      inputs: [
        { internalType: 'address', name: 'delegatee', type: 'address' },
        { internalType: 'uint256', name: 'nonce', type: 'uint256' },
        { internalType: 'uint256', name: 'expiry', type: 'uint256' },
        { internalType: 'uint8', name: 'v', type: 'uint8' },
        { internalType: 'bytes32', name: 'r', type: 'bytes32' },
        { internalType: 'bytes32', name: 's', type: 'bytes32' },
      ],
      name: 'delegateBySig',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      constant: true,
      inputs: [{ internalType: 'address', name: '', type: 'address' }],
      name: 'delegates',
      outputs: [{ internalType: 'address', name: '', type: 'address' }],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: true,
      inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
      name: 'getCurrentVotes',
      outputs: [{ internalType: 'uint96', name: '', type: 'uint96' }],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: true,
      inputs: [
        { internalType: 'address', name: 'account', type: 'address' },
        { internalType: 'uint256', name: 'blockNumber', type: 'uint256' },
      ],
      name: 'getPriorVotes',
      outputs: [{ internalType: 'uint96', name: '', type: 'uint96' }],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: true,
      inputs: [],
      name: 'minimumTimeBetweenMints',
      outputs: [{ internalType: 'uint32', name: '', type: 'uint32' }],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: false,
      inputs: [
        { internalType: 'address', name: 'dst', type: 'address' },
        { internalType: 'uint256', name: 'rawAmount', type: 'uint256' },
      ],
      name: 'mint',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      constant: true,
      inputs: [],
      name: 'mintCap',
      outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: true,
      inputs: [],
      name: 'minter',
      outputs: [{ internalType: 'address', name: '', type: 'address' }],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: true,
      inputs: [],
      name: 'mintingAllowedAfter',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: true,
      inputs: [],
      name: 'name',
      outputs: [{ internalType: 'string', name: '', type: 'string' }],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: true,
      inputs: [{ internalType: 'address', name: '', type: 'address' }],
      name: 'nonces',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: true,
      inputs: [{ internalType: 'address', name: '', type: 'address' }],
      name: 'numCheckpoints',
      outputs: [{ internalType: 'uint32', name: '', type: 'uint32' }],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: false,
      inputs: [
        { internalType: 'address', name: 'owner', type: 'address' },
        { internalType: 'address', name: 'spender', type: 'address' },
        { internalType: 'uint256', name: 'rawAmount', type: 'uint256' },
        { internalType: 'uint256', name: 'deadline', type: 'uint256' },
        { internalType: 'uint8', name: 'v', type: 'uint8' },
        { internalType: 'bytes32', name: 'r', type: 'bytes32' },
        { internalType: 'bytes32', name: 's', type: 'bytes32' },
      ],
      name: 'permit',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      constant: false,
      inputs: [{ internalType: 'address', name: 'minter_', type: 'address' }],
      name: 'setMinter',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      constant: true,
      inputs: [],
      name: 'symbol',
      outputs: [{ internalType: 'string', name: '', type: 'string' }],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: true,
      inputs: [],
      name: 'totalSupply',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: false,
      inputs: [
        { internalType: 'address', name: 'dst', type: 'address' },
        { internalType: 'uint256', name: 'rawAmount', type: 'uint256' },
      ],
      name: 'transfer',
      outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      constant: false,
      inputs: [
        { internalType: 'address', name: 'src', type: 'address' },
        { internalType: 'address', name: 'dst', type: 'address' },
        { internalType: 'uint256', name: 'rawAmount', type: 'uint256' },
      ],
      name: 'transferFrom',
      outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ];
}

function getMasterChefAbi() {
  return [
    {
      inputs: [
        {
          internalType: 'contract IMasterChef',
          name: '_MASTER_CHEF',
          type: 'address',
        },
        { internalType: 'contract IERC20', name: '_sushi', type: 'address' },
        { internalType: 'uint256', name: '_MASTER_PID', type: 'uint256' },
      ],
      stateMutability: 'nonpayable',
      type: 'constructor',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'user',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'uint256',
          name: 'pid',
          type: 'uint256',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'amount',
          type: 'uint256',
        },
        { indexed: true, internalType: 'address', name: 'to', type: 'address' },
      ],
      name: 'Deposit',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'user',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'uint256',
          name: 'pid',
          type: 'uint256',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'amount',
          type: 'uint256',
        },
        { indexed: true, internalType: 'address', name: 'to', type: 'address' },
      ],
      name: 'EmergencyWithdraw',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'user',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'uint256',
          name: 'pid',
          type: 'uint256',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'amount',
          type: 'uint256',
        },
      ],
      name: 'Harvest',
      type: 'event',
    },
    { anonymous: false, inputs: [], name: 'LogInit', type: 'event' },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'uint256',
          name: 'pid',
          type: 'uint256',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'allocPoint',
          type: 'uint256',
        },
        {
          indexed: true,
          internalType: 'contract IERC20',
          name: 'lpToken',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'contract IRewarder',
          name: 'rewarder',
          type: 'address',
        },
      ],
      name: 'LogPoolAddition',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'uint256',
          name: 'pid',
          type: 'uint256',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'allocPoint',
          type: 'uint256',
        },
        {
          indexed: true,
          internalType: 'contract IRewarder',
          name: 'rewarder',
          type: 'address',
        },
        {
          indexed: false,
          internalType: 'bool',
          name: 'overwrite',
          type: 'bool',
        },
      ],
      name: 'LogSetPool',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'uint256',
          name: 'pid',
          type: 'uint256',
        },
        {
          indexed: false,
          internalType: 'uint64',
          name: 'lastRewardBlock',
          type: 'uint64',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'lpSupply',
          type: 'uint256',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'accSushiPerShare',
          type: 'uint256',
        },
      ],
      name: 'LogUpdatePool',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'previousOwner',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'newOwner',
          type: 'address',
        },
      ],
      name: 'OwnershipTransferred',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'user',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'uint256',
          name: 'pid',
          type: 'uint256',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'amount',
          type: 'uint256',
        },
        { indexed: true, internalType: 'address', name: 'to', type: 'address' },
      ],
      name: 'Withdraw',
      type: 'event',
    },
    {
      inputs: [],
      name: 'MASTER_CHEF',
      outputs: [
        { internalType: 'contract IMasterChef', name: '', type: 'address' },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'MASTER_PID',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'SUSHI',
      outputs: [{ internalType: 'contract IERC20', name: '', type: 'address' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        { internalType: 'uint256', name: 'allocPoint', type: 'uint256' },
        { internalType: 'contract IERC20', name: '_lpToken', type: 'address' },
        {
          internalType: 'contract IRewarder',
          name: '_rewarder',
          type: 'address',
        },
      ],
      name: 'add',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        { internalType: 'bytes[]', name: 'calls', type: 'bytes[]' },
        { internalType: 'bool', name: 'revertOnFail', type: 'bool' },
      ],
      name: 'batch',
      outputs: [
        { internalType: 'bool[]', name: 'successes', type: 'bool[]' },
        { internalType: 'bytes[]', name: 'results', type: 'bytes[]' },
      ],
      stateMutability: 'payable',
      type: 'function',
    },
    {
      inputs: [],
      name: 'claimOwnership',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        { internalType: 'uint256', name: 'pid', type: 'uint256' },
        { internalType: 'uint256', name: 'amount', type: 'uint256' },
        { internalType: 'address', name: 'to', type: 'address' },
      ],
      name: 'deposit',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        { internalType: 'uint256', name: 'pid', type: 'uint256' },
        { internalType: 'address', name: 'to', type: 'address' },
      ],
      name: 'emergencyWithdraw',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        { internalType: 'uint256', name: 'pid', type: 'uint256' },
        { internalType: 'address', name: 'to', type: 'address' },
      ],
      name: 'harvest',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [],
      name: 'harvestFromMasterChef',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'contract IERC20',
          name: 'dummyToken',
          type: 'address',
        },
      ],
      name: 'init',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      name: 'lpToken',
      outputs: [{ internalType: 'contract IERC20', name: '', type: 'address' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'uint256[]', name: 'pids', type: 'uint256[]' }],
      name: 'massUpdatePools',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'uint256', name: '_pid', type: 'uint256' }],
      name: 'migrate',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [],
      name: 'migrator',
      outputs: [
        { internalType: 'contract IMigratorChef', name: '', type: 'address' },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'owner',
      outputs: [{ internalType: 'address', name: '', type: 'address' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'pendingOwner',
      outputs: [{ internalType: 'address', name: '', type: 'address' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        { internalType: 'uint256', name: '_pid', type: 'uint256' },
        { internalType: 'address', name: '_user', type: 'address' },
      ],
      name: 'pendingSushi',
      outputs: [{ internalType: 'uint256', name: 'pending', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        { internalType: 'contract IERC20', name: 'token', type: 'address' },
        { internalType: 'address', name: 'from', type: 'address' },
        { internalType: 'address', name: 'to', type: 'address' },
        { internalType: 'uint256', name: 'amount', type: 'uint256' },
        { internalType: 'uint256', name: 'deadline', type: 'uint256' },
        { internalType: 'uint8', name: 'v', type: 'uint8' },
        { internalType: 'bytes32', name: 'r', type: 'bytes32' },
        { internalType: 'bytes32', name: 's', type: 'bytes32' },
      ],
      name: 'permitToken',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      name: 'poolInfo',
      outputs: [
        { internalType: 'uint128', name: 'accSushiPerShare', type: 'uint128' },
        { internalType: 'uint64', name: 'lastRewardBlock', type: 'uint64' },
        { internalType: 'uint64', name: 'allocPoint', type: 'uint64' },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'poolLength',
      outputs: [{ internalType: 'uint256', name: 'pools', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      name: 'rewarder',
      outputs: [
        { internalType: 'contract IRewarder', name: '', type: 'address' },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        { internalType: 'uint256', name: '_pid', type: 'uint256' },
        { internalType: 'uint256', name: '_allocPoint', type: 'uint256' },
        {
          internalType: 'contract IRewarder',
          name: '_rewarder',
          type: 'address',
        },
        { internalType: 'bool', name: 'overwrite', type: 'bool' },
      ],
      name: 'set',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'contract IMigratorChef',
          name: '_migrator',
          type: 'address',
        },
      ],
      name: 'setMigrator',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [],
      name: 'sushiPerBlock',
      outputs: [{ internalType: 'uint256', name: 'amount', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'totalAllocPoint',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        { internalType: 'address', name: 'newOwner', type: 'address' },
        { internalType: 'bool', name: 'direct', type: 'bool' },
        { internalType: 'bool', name: 'renounce', type: 'bool' },
      ],
      name: 'transferOwnership',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'uint256', name: 'pid', type: 'uint256' }],
      name: 'updatePool',
      outputs: [
        {
          components: [
            {
              internalType: 'uint128',
              name: 'accSushiPerShare',
              type: 'uint128',
            },
            { internalType: 'uint64', name: 'lastRewardBlock', type: 'uint64' },
            { internalType: 'uint64', name: 'allocPoint', type: 'uint64' },
          ],
          internalType: 'struct MasterChefV2.PoolInfo',
          name: 'pool',
          type: 'tuple',
        },
      ],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        { internalType: 'uint256', name: '', type: 'uint256' },
        { internalType: 'address', name: '', type: 'address' },
      ],
      name: 'userInfo',
      outputs: [
        { internalType: 'uint256', name: 'amount', type: 'uint256' },
        { internalType: 'int256', name: 'rewardDebt', type: 'int256' },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        { internalType: 'uint256', name: 'pid', type: 'uint256' },
        { internalType: 'uint256', name: 'amount', type: 'uint256' },
        { internalType: 'address', name: 'to', type: 'address' },
      ],
      name: 'withdraw',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        { internalType: 'uint256', name: 'pid', type: 'uint256' },
        { internalType: 'uint256', name: 'amount', type: 'uint256' },
        { internalType: 'address', name: 'to', type: 'address' },
      ],
      name: 'withdrawAndHarvest',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ];
}

export {
  ChainConfig,
  getRPCProvider,
  //   getW3Provider,
  //   buildBridgeContract,
  //   getTokenContract,
  //   getStableSwapPoolForNetwork,
  //   getBasePoolAbi,
  //   getBridgeContractAbi,
  buildTokenContract,
  getBareERC20Abi,
  getMasterChefAbi,
};
