export const ApprovalHash =
  '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925';

export const Topics: { [hash: string]: { eventName: string } } = {
  '0x02d7e648dd130fc184d383e55bb126ac4c9c60e8f94bf05acdf557ba2d540b47': {
    // https://github.com/synapsecns/synapse-contracts/blob/master/contracts/bridge/SynapseBridge.sol#L116
    eventName: 'Transfer',
    // direction: 'OUT',
  },
};

/**
 *
 * @returns {[String]}
 */
export function getTopicsHash() {
  return Object.keys(Topics);
}

/**
 *
 * @param {string} hash
 * @returns {Object}
 */
export function getEventForTopic(hash: string) {
  return Topics[hash];
}
