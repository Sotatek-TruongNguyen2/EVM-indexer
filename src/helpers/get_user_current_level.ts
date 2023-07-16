import BigNumber from "bignumber.js";
import { UserLevel } from "../services/handlers/constants";
import { User } from "../services/handlers/models/user.model";
import { EnvironmentConfig } from "../config/env";

export const get_user_current_level = async (
  branches: Map<string, string>,
): Promise<UserLevel> => {
  const environment_config = EnvironmentConfig.getInstance();
  const branch_types = {};
  let unknown_branches_staking = "0";
  // const sapphire_branches = [];
  // const emerald_branches = [];
  // const diamond_branches = [];
  // const blue_diamond_branches = [];
  // const black_diamond_branches = [];
  const F1s = Object.keys(branches);

  if (F1s.length > 0) {
    const f1s_detail = await User.aggregate([
      {
        $match: {
          address: { $in: F1s },
        },
      },
      {
        $project: {
          level: 1,
          address: 1,
        },
      },
    ]);

    for (let f1 of f1s_detail) {
      branch_types[f1.level] += (branch_types[f1.level] || 0) + 1;
      if (f1.level === UserLevel.UNKNOWN) {
        unknown_branches_staking = new BigNumber(unknown_branches_staking)
          .plus(
            new BigNumber(branches[f1.address]).gt(
              environment_config.MAXIMUM_BRANCH_STAKING,
            )
              ? new BigNumber(environment_config.MAXIMUM_BRANCH_STAKING)
              : new BigNumber(branches[f1.address]),
          )
          .toString();
      }
    }

    if (branch_types[UserLevel.BLACK_DIAMOND] >= 3) {
      return UserLevel.CROWN_DIAMOND;
    }

    if (branch_types[UserLevel.BLUE_DIAMOND] >= 3) {
      return UserLevel.BLACK_DIAMOND;
    }

    if (branch_types[UserLevel.DIAMOND] >= 3) {
      return UserLevel.BLUE_DIAMOND;
    }

    if (
      branch_types[UserLevel.EMERALD] >= 2 &&
      branch_types[UserLevel.RUBY] >= 1
    ) {
      return UserLevel.DIAMOND;
    }

    if (
      branch_types[UserLevel.RUBY] >= 2 &&
      branch_types[UserLevel.SAPPHIRE] >= 1
    ) {
      return UserLevel.EMERALD;
    }

    if (branch_types[UserLevel.SAPPHIRE] >= 2) {
      return UserLevel.RUBY;
    }

    if (
      new BigNumber(unknown_branches_staking).gte(
        new BigNumber(environment_config.SHAPPIRE_LEVEL_STAKING_CONDITION),
      )
    ) {
      return UserLevel.SAPPHIRE;
    }
  }

  return UserLevel.UNKNOWN;
};
