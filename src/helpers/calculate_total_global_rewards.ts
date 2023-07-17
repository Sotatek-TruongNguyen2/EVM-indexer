import BigNumber from "bignumber.js";

// 365 days
const SECONDS_IN_YEAR_IN_SECONDS = 365 * 86400;
// const ACCUMULATIVE_PRECISION = 1e18;

export const calculate_total_global_rewards = (
  accumulative_index: number,
  total_global_reward: string,
  global_interest_rate: number,
  last_accrued_timestamp: number,
  current_timestamp: number,
) => {
  // const current_day_unix = Math.floor(Date.now() / 1000);

  if (new BigNumber(global_interest_rate).eq(new BigNumber(0))) {
    return {
      total_global_reward: total_global_reward,
      last_accrued_timestamp: current_timestamp,
    };
  }

  const pending_rewards = new BigNumber(
    current_timestamp - last_accrued_timestamp,
  )
    .multipliedBy(accumulative_index)
    .multipliedBy(global_interest_rate)
    .div(SECONDS_IN_YEAR_IN_SECONDS)
    .div(10000);
  // .div(ACCUMULATIVE_PRECISION);
  // .toFixed();
  // global_interest_rate;

  return {
    total_global_reward: new BigNumber(total_global_reward)
      .plus(pending_rewards)
      .toString(),
    last_accrued_timestamp: current_timestamp,
  };
};
