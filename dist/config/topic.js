"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEventForTopic = exports.getTopicsHash = exports.Topics = exports.ApprovalHash = void 0;
exports.ApprovalHash = '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925';
exports.Topics = {
    // '0x02d7e648dd130fc184d383e55bb126ac4c9c60e8f94bf05acdf557ba2d540b47': {
    //   // https://github.com/synapsecns/synapse-contracts/blob/master/contracts/bridge/SynapseBridge.sol#L116
    //   eventName: 'Transfer',
    //   // direction: 'OUT',
    // },
    '0x7ed629d198faf210a8b65c3c30bf1ab4a789fb6123ed208a03358fcebe7c9dd8': {
        eventName: 'ReferralLevelAdded',
    },
    '0x5548c837ab068cf56a2c2479df0882a4922fd203edb7517321831d95078c5f62': {
        eventName: 'Deposit',
    },
    '0x00735a7974318eab881fca7e6e81da821897b276ce2d5bcf5bd5679d8da792ad': {
        eventName: 'CommissionRewardReferrerByLevel',
    },
};
/**
 *
 * @returns {[String]}
 */
function getTopicsHash() {
    return Object.keys(exports.Topics);
}
exports.getTopicsHash = getTopicsHash;
/**
 *
 * @param {string} hash
 * @returns {Object}
 */
function getEventForTopic(hash) {
    return exports.Topics[hash];
}
exports.getEventForTopic = getEventForTopic;
