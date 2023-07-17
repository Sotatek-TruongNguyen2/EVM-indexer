import { ethers } from "ethers";
import { BigNumber } from "bignumber.js";

import { IUserModel, User } from "../models/user.model";
import { IUser } from "../types/IUser";
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
  ACCUMULATIVE_PRECISION,
  BASIS_POINT,
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
  user: IUser,
  old?: boolean,
): Promise<IUserModel> => {
  let current_user = await retrieve_user(user.address);
  let old_current_user = Object.assign({}, current_user);

  if (
    current_user.referralBy === ethers.constants.AddressZero &&
    user.referralBy != ethers.constants.AddressZero
  ) {
    await retrieve_user(user.referralBy);
    await update_referral_tree_path(user.address, user.referralBy);
    current_user.referralBy = user.referralBy;
  }

  current_user.current_deposit = new BigNumber(current_user.current_deposit)
    .plus(new BigNumber(user.deposit_amount).div(1e18))
    .toString();

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
      } = ancestor;

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
        global_interest_rate,
        last_accrued_timestamp,
        timestamp,
      );

      // Retrieve user current level
      let current_level = await get_user_current_level(
        user_data_trie,
        branches,
      );

      let updated_accumulative_index;

      // Check if previous user level is unknown
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
      } else {
        let accumulative_index_diff = new BigNumber(
          newest_current_user.current_deposit,
        )
          .multipliedBy(newest_current_user.interest_rate)
          .div(BASIS_POINT)
          .minus(
            new BigNumber(user.current_deposit)
              .multipliedBy(new BigNumber(user.interest_rate))
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

      let user_global_referral_interest_rate =
        UserLevelGlobalInterest[current_level];

      // Insert current level and staking interest rate into user data trie for further query
      trie = upsert_new_node(ancestor._id, trie, {
        current_level: current_level,
        // interest_rate: ancestor.interest_rate,
        // total_deposit_amount: ancestor,
      });

      users_level_after_modify[ancestor._id] = {
        global_interest_rate: user_global_referral_interest_rate,
        current_level,
        branches,
        last_accrued_timestamp: updated_last_accrued_timestamp,
        total_global_reward: updated_total_global_reward,
        accumulative_index: updated_accumulative_index.toFixed(),
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
