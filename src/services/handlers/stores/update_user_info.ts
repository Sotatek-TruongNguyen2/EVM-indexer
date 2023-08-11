import { ethers } from "ethers";
import { BigNumber } from "bignumber.js";

import { IUserModel, User } from "../models/user.model";
// import { IUser } from "../types/IUser";
import { UserLevel } from "../constants";
import {
  get_user_current_level,
  get_user_data_trie,
  upsert_new_node,
} from "./trie";
import { UserTreePath } from "../models/tree-path";
import { Document } from "mongodb";
import { upsert_user_data } from "./trie";
import { UserDataTrie } from "../models/trie";
import {
  BASIS_POINT,
  USER_LEVEL_PASSED_INTEREST,
  UserLevelGlobalInterest,
  UserStakingInterest,
} from "../constants/user";
import { calculate_total_global_rewards } from "../../../helpers/calculate_total_global_rewards";

export const retrieve_user_referral_descendants = async (
  user_addr: string,
): Promise<IUserModel[]> => {
  const descendants = await UserTreePath.aggregate([
    {
      $match: {
        ancestor: {
          $eq: user_addr,
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "descendant",
        foreignField: "_id",
        as: "descendant",
      },
    },
  ]);

  return descendants;
};

export const retrieve_user = async (user_addr: string): Promise<IUserModel> => {
  let current_user = await User.findOne({
    _id: {
      $eq: user_addr,
    },
  });

  if (!current_user) {
    let inserted_user = new User({
      _id: user_addr,
      current_deposit: new BigNumber(0).toString(),
      referralBy: ethers.constants.AddressZero,
      level: UserLevel.UNKNOWN,
    });

    current_user = await inserted_user.save();

    await UserTreePath.updateOne(
      {
        $and: [{ ancestor: user_addr }, { descendant: user_addr }],
      },
      {
        $set: {
          ancestor: user_addr,
          descendant: user_addr,
        },
      },
      {
        upsert: true,
      },
    );

    await upsert_user_data(user_addr);
  }

  return current_user;
};

export const update_user_info = async (
  user_address: string,
  amount: string,
  referralBy: string,
  old?: boolean,
  withdraw?: boolean,
): Promise<IUserModel> => {
  let current_user = await retrieve_user(user_address);
  let old_current_user = Object.assign({}, current_user);

  if (
    current_user.referralBy === ethers.constants.AddressZero &&
    referralBy != ethers.constants.AddressZero
  ) {
    await retrieve_user(referralBy);
    await update_referral_tree_path(user_address, referralBy);
    current_user.referralBy = referralBy;
  }

  const updated_current_deposit = withdraw
    ? new BigNumber(current_user.current_deposit).minus(
        new BigNumber(amount).div(1e18),
      )
    : new BigNumber(current_user.current_deposit).plus(
        new BigNumber(amount).div(1e18),
      );

  current_user.current_deposit = (
    updated_current_deposit.lte(0) ? new BigNumber(0) : updated_current_deposit
  ).toString();

  Object.keys(UserStakingInterest).map((staking_range) => {
    const [from, to] = staking_range.split("-");

    if (
      new BigNumber(current_user.current_deposit).gte(new BigNumber(from)) &&
      new BigNumber(current_user.current_deposit).lt(
        new BigNumber(to || Number.MAX_VALUE),
      )
    ) {
      current_user.interest_rate = UserStakingInterest[staking_range];
    }
  });

  await current_user.save();

  return old ? (old_current_user as any)._doc : current_user;
};

export const update_referral_tree_path = async (
  user_addr: string,
  referrer: string,
) => {
  let ancestor_descendants: Document[] = [];

  const referrer_ancestors = await UserTreePath.find({
    descendant: {
      $eq: referrer,
    },
  });

  for (let referrer_ancestor of referrer_ancestors) {
    let path_length = referrer_ancestor.path_length;
    ancestor_descendants.push(
      new UserTreePath({
        path_length: path_length + 1,
        ancestor: referrer_ancestor.ancestor,
        descendant: user_addr,
      }),
    );
  }

  await UserTreePath.insertMany(ancestor_descendants);
};

export const update_user_branches = async (
  user: IUserModel, // Old user details
  amount: string,
  timestamp: number,
) => {
  let user_ancestors = await UserTreePath.aggregate([
    {
      $match: {
        $and: [
          {
            descendant: user._id,
          },
          {
            $and: [
              {
                path_length: {
                  $gte: 0,
                },
              },
              // {
              //   path_length: {
              //     $lte: 7,
              //   },
              // },
            ],
          },
        ],
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "ancestor",
        foreignField: "_id",
        as: "ancestor",
      },
    },
    {
      $unwind: "$ancestor",
    },
    {
      $sort: {
        path_length: 1,
      },
    },
  ]);

  let user_data_trie = await get_user_data_trie();

  if (user_ancestors.length && user_ancestors.length > 1 && user_data_trie) {
    // Get current newest user details
    let newest_current_user = user_ancestors[0].ancestor;

    let trie = user_data_trie.trie;
    let users_level_after_modify = {};

    //  Need to slice the first element to remove current user from list of ancestors
    user_ancestors = user_ancestors.slice(1);

    // Insert current level and staking interest rate into user data trie for further query
    trie = upsert_new_node(newest_current_user._id, trie, {
      // current_level: current_level,
      interest_rate: newest_current_user.interest_rate,
      total_deposit_amount: newest_current_user.current_deposit,
    });

    for (let [index, user_ancestor] of user_ancestors.entries()) {
      let { ancestor, path_length } = user_ancestor;
      let {
        branches,
        accumulative_index,
        last_accrued_timestamp,
        total_global_reward,
        global_interest_rate,
        global_interest_rate_enabled,
        accumulative_index_by_branch,
        disable_branches,
      } = ancestor;

      //
      let F1_branch_address =
        path_length > 1 ? user_ancestors[index - 1].ancestor._id : user._id;

      let current_branch_staking = branches[F1_branch_address] || "0";
      branches[F1_branch_address] = new BigNumber(current_branch_staking)
        .plus(new BigNumber(amount).div(1e18))
        .toString();

      // Calculate ancestor current global rewards
      let {
        total_global_reward: updated_total_global_reward,
        last_accrued_timestamp: updated_last_accrued_timestamp,
      } = calculate_total_global_rewards(
        accumulative_index,
        total_global_reward,
        // Check if all branch has been disabled,
        // then global_interest_rate equals 0, otherwise will be the default
        global_interest_rate_enabled === true ? 0 : global_interest_rate,
        last_accrued_timestamp,
        timestamp,
      );

      // Retrieve ancestor current level
      let current_level = await get_user_current_level(
        user_data_trie,
        branches,
      );

      let { updated_accumulative_index, accumulative_index_diff } =
        await try_update_accumulative_index(
          ancestor,
          user,
          newest_current_user,
          accumulative_index,
          current_level,
        );

      // Update Accumulative index diff for each branch
      accumulative_index_by_branch[F1_branch_address] = new BigNumber(
        accumulative_index_by_branch[F1_branch_address] || 0,
      ).plus(accumulative_index_diff);

      const {
        updated_accumulative_index: new_updated_accumulative_index,
        disable_branches: updated_disable_branches,
        global_interest_rate_enabled: updated_global_interest_rate_enabled,
      } = await try_check_break_branch_rules(
        ancestor._id,
        current_level,
        new BigNumber(accumulative_index_diff),
        accumulative_index_by_branch,
        new BigNumber(accumulative_index),
        disable_branches,
      );

      global_interest_rate_enabled = updated_global_interest_rate_enabled;
      updated_accumulative_index = new_updated_accumulative_index;
      disable_branches = updated_disable_branches;

      // console.log(
      //   "updated_accumulative_index: ",
      //   updated_accumulative_index.toString(),
      // );

      // Insert current level and staking interest rate into user data trie for further query
      trie = upsert_new_node(ancestor._id, trie, {
        current_level: current_level,
        // interest_rate: ancestor.interest_rate,
        // total_deposit_amount: ancestor,
      });

      let user_global_referral_interest_rate =
        UserLevelGlobalInterest[current_level];

      // Update if the user current level is currently passing their ancestor level
      // @dev: current user in here is the current ancestor in the loop
      if (current_level !== ancestor.level) {
        console.log("WE IN HERE");
        // Find all current user ancestors
        let ancestor_ancestors = await UserTreePath.aggregate([
          {
            $match: {
              $and: [
                {
                  descendant: ancestor._id,
                },
                {
                  $and: [
                    {
                      path_length: {
                        $gt: 0,
                      },
                    },
                  ],
                },
              ],
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "ancestor",
              foreignField: "_id",
              as: "ancestor",
            },
          },
          {
            $unwind: "$ancestor",
          },
        ]);

        for (let ancestor_ancestor of ancestor_ancestors) {
          let temp_ancestor_ancestor = ancestor_ancestor.ancestor;

          // Find any ancestor that has level equals current user level
          if (temp_ancestor_ancestor.level === current_level) {
            // Calculate passing reword
            let {
              total_global_reward:
                ancestor_ancestor_updated_total_global_reward,
              last_accrued_timestamp:
                ancestor_ancestor_updated_last_accrued_timestamp,
            } = calculate_total_global_rewards(
              temp_ancestor_ancestor.accumulative_index,
              temp_ancestor_ancestor.total_global_reward,
              temp_ancestor_ancestor.global_interest_rate,
              temp_ancestor_ancestor.last_accrued_timestamp,
              timestamp,
            );

            // @dev: Because the ancestor'ancestor
            users_level_after_modify[temp_ancestor_ancestor._id] = {
              global_interest_rate: temp_ancestor_ancestor.global_interest_rate,
              current_level: temp_ancestor_ancestor.current_level,
              branches: temp_ancestor_ancestor.branches,
              last_accrued_timestamp:
                ancestor_ancestor_updated_last_accrued_timestamp,
              total_global_reward:
                ancestor_ancestor_updated_total_global_reward,
              accumulative_index: temp_ancestor_ancestor.accumulative_index,
              disable_branches: temp_ancestor_ancestor.disable_branches,
              accumulative_index_by_branch:
                temp_ancestor_ancestor.accumulative_index_by_branch,
              global_interest_rate_enabled:
                temp_ancestor_ancestor.global_interest_rate_enabled,
            };
          }

          // Check if current user level is passed their ancestor level. Reward 1%
          if (
            UserLevelGlobalInterest[current_level] >
            UserLevelGlobalInterest[temp_ancestor_ancestor.level]
          ) {
            // Update ancestor latest reward
            let ancestor_ancestor_updated_total_global_reward = new BigNumber(
              temp_ancestor_ancestor.total_global_reward,
            )
              .plus(
                new BigNumber(temp_ancestor_ancestor.accumulative_index)
                  .multipliedBy(USER_LEVEL_PASSED_INTEREST)
                  .div(10000),
              )
              .toString();

            users_level_after_modify[temp_ancestor_ancestor._id] = {
              global_interest_rate: temp_ancestor_ancestor.global_interest_rate,
              current_level: temp_ancestor_ancestor.current_level,
              branches: temp_ancestor_ancestor.branches,
              last_accrued_timestamp:
                temp_ancestor_ancestor.last_accrued_timestamp,
              total_global_reward:
                ancestor_ancestor_updated_total_global_reward,
              accumulative_index: temp_ancestor_ancestor.accumulative_index,
              disable_branches: temp_ancestor_ancestor.disable_branches,
              accumulative_index_by_branch:
                temp_ancestor_ancestor.accumulative_index_by_branch,
              global_interest_rate_enabled:
                temp_ancestor_ancestor.global_interest_rate_enabled,
            };
          }
        }
      }

      users_level_after_modify[ancestor._id] = {
        global_interest_rate: user_global_referral_interest_rate,
        current_level,
        branches,
        last_accrued_timestamp: updated_last_accrued_timestamp,
        total_global_reward: updated_total_global_reward,
        accumulative_index: updated_accumulative_index.toFixed(),
        disable_branches,
        accumulative_index_by_branch,
        global_interest_rate_enabled,
      };
    }

    await User.bulkWrite(
      Object.keys(users_level_after_modify).map((ancestor_address) => {
        const {
          current_level,
          total_global_reward,
          global_interest_rate,
          branches,
          accumulative_index,
          last_accrued_timestamp,
          disable_branches,
          accumulative_index_by_branch,
          global_interest_rate_enabled,
        } = users_level_after_modify[ancestor_address];
        return {
          updateOne: {
            filter: { _id: ancestor_address },
            update: {
              level: current_level,
              branches,
              global_interest_rate,
              total_global_reward,
              accumulative_index,
              last_accrued_timestamp,
              disable_branches,
              accumulative_index_by_branch,
              global_interest_rate_enabled,
            },
            upsert: true,
          },
        };
      }),
    );

    await UserDataTrie.findByIdAndUpdate(
      user_data_trie ? user_data_trie._id : undefined,
      {
        $set: {
          trie,
        },
      },
      {
        upsert: true,
      },
    );
  }
};

async function try_check_break_branch_rules(
  ancestor_address: string,
  ancestor_level: UserLevel,
  accumulative_index_diff: BigNumber,
  accumulative_index_by_branch: BigNumber,
  accumulative_index: BigNumber,
  disable_branches: Map<string, boolean>,
): Promise<{
  global_interest_rate_enabled: boolean;
  updated_accumulative_index: BigNumber;
  disable_branches: Map<string, boolean>;
}> {
  // Retrieve all child to see if we have any child that has equal level
  let ancestor_descendants = await UserTreePath.aggregate([
    {
      $match: {
        $and: [
          {
            ancestor: ancestor_address,
          },
          {
            $and: [
              {
                path_length: {
                  $gt: 0,
                },
              },
            ],
          },
        ],
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "descendant",
        foreignField: "_id",
        as: "descendant",
      },
    },
    {
      $unwind: "$descendant",
    },
    // {
    //   $sort: {
    //     path_length: 1,
    //   },
    // },
  ]);

  let descendant_to_path_length = {};
  let ancestor_F1_address_branch_break_rule = {};
  let global_interest_rate_enabled = false;
  // Total ancestor F1s
  let total_F1s = 0;

  for (let ancestor_descendant of ancestor_descendants) {
    if (ancestor_descendant.path_length === 1) {
      total_F1s++;
    }

    descendant_to_path_length[ancestor_descendant.descendant._id] = {
      path_length: ancestor_descendant.path_length,
      referralBy: ancestor_descendant.descendant.referralBy,
    };
  }

  for (let [index, ancestor_descendant] of ancestor_descendants.entries()) {
    let descendant = ancestor_descendant.descendant;
    let F1_address = descendant._id;

    // Need to go recursive to which branch users belong to. (Find user's F1)
    // @dev: Done by recursive
    while (true) {
      const { path_length, referralBy } = descendant_to_path_length[F1_address];
      if (path_length === 1) {
        break;
      }
      F1_address = referralBy;
    }

    if (
      UserLevelGlobalInterest[descendant.level] >=
      UserLevelGlobalInterest[ancestor_level]
    ) {
      ancestor_F1_address_branch_break_rule[F1_address] = true;
    }
  }

  let updated_accumulative_index;

  Object.keys(ancestor_F1_address_branch_break_rule).map((F1_address) => {
    const break_rule = ancestor_F1_address_branch_break_rule[F1_address];
    if (!disable_branches[F1_address] && break_rule) {
      disable_branches[F1_address] = true;
      updated_accumulative_index = accumulative_index.minus(
        accumulative_index_by_branch[F1_address],
      );
    }

    if (disable_branches[F1_address] && !break_rule) {
      disable_branches[F1_address] = false;
      updated_accumulative_index = accumulative_index.plus(
        accumulative_index_by_branch[F1_address],
      );
    }

    if (disable_branches[F1_address] && break_rule) {
      // @dev: In both case user deposit and withdraw tokens, we must subtract the diff from updated_accumulative_index
      updated_accumulative_index = accumulative_index.minus(
        new BigNumber(accumulative_index_diff.abs()),
      );
    }
  });

  // Check if all F1 branch has been disabled
  if (Object.keys(ancestor_F1_address_branch_break_rule).length === total_F1s) {
    global_interest_rate_enabled = true;
  }

  return {
    global_interest_rate_enabled,
    updated_accumulative_index,
    disable_branches,
  };
}

async function try_update_accumulative_index(
  ancestor,
  old_user,
  newest_current_user,
  accumulative_index,
  current_level: UserLevel,
): Promise<{
  updated_accumulative_index: BigNumber;
  accumulative_index_diff: BigNumber;
}> {
  let updated_accumulative_index;
  let accumulative_index_diff;

  if (
    ancestor.level === UserLevel.UNKNOWN &&
    current_level != UserLevel.UNKNOWN
  ) {
    let ancestor_descendants = await UserTreePath.aggregate([
      {
        $match: {
          $and: [
            {
              ancestor: ancestor._id,
            },
            {
              $and: [
                {
                  path_length: {
                    $gt: 0,
                  },
                },
              ],
            },
          ],
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "descendant",
          foreignField: "_id",
          as: "descendant",
        },
      },
      {
        $unwind: "$descendant",
      },
    ]);

    let temp_accumulative_index = new BigNumber(0);

    for (let ancestor_descendant of ancestor_descendants) {
      let descendant = ancestor_descendant.descendant;
      temp_accumulative_index = temp_accumulative_index.plus(
        new BigNumber(descendant.current_deposit)
          .multipliedBy(descendant.interest_rate)
          .div(BASIS_POINT),
      );
    }

    updated_accumulative_index = temp_accumulative_index;
    accumulative_index_diff = temp_accumulative_index;
  } else {
    accumulative_index_diff = new BigNumber(newest_current_user.current_deposit)
      .multipliedBy(newest_current_user.interest_rate)
      .div(BASIS_POINT)
      .minus(
        new BigNumber(old_user.current_deposit)
          .multipliedBy(new BigNumber(old_user.interest_rate))
          .div(BASIS_POINT),
      );

    updated_accumulative_index = new BigNumber(accumulative_index).plus(
      accumulative_index_diff,
      // .div(SECONDS_IN_YEAR_IN_MILLISECONDS),
    );
    updated_accumulative_index = updated_accumulative_index.gt(0)
      ? updated_accumulative_index
      : new BigNumber(0);
  }

  return { updated_accumulative_index, accumulative_index_diff };
}
