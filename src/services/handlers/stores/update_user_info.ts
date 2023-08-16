import { ethers } from "ethers";
import { BigNumber } from "bignumber.js";

import { DescendantPassingLevel, IUserModel, User } from "../models/user.model";
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
import { trim_0x_in_address } from "../../../utils/address";

export const retrieve_user_descendants_by_addr = async (
  user_addr: string,
): Promise<IUserModel[]> => {
  const descendants = await UserTreePath.aggregate([
    {
      $match: {
        $and: [
          {
            ancestor: user_addr,
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

  return descendants;
};

/// @title Find User by user ethereum address
/// @author Arthur Nguyen
/// @notice This function are currently implemented for retrieving user information in the db
/// @dev I'm also using Patricia Trie for faster query user level
export const retrieve_user = async (user_addr: string): Promise<IUserModel> => {
  let current_user = await User.findOne({
    _id: {
      $eq: user_addr,
    },
  });

  // @dev: Just in case current user doesn't exists in the database, Create this user in the db
  if (!current_user) {
    let inserted_user = new User({
      _id: user_addr,
      current_deposit: new BigNumber(0).toString(),
      referralBy: ethers.constants.AddressZero,
      level: UserLevel.UNKNOWN,
    });

    current_user = await inserted_user.save();

    // @dev: Insert user is both descendant, ancestor to themselves at level 0 (DEFAULT)
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

    // @dev: Insert user data into Patricia Trie
    await upsert_user_data(user_addr, {
      current_level: UserLevel.UNKNOWN,
    });
  }

  return current_user;
};

/// @title Update user info when we receive 'Deposit' event of that user
/// @author Arthur Nguyen
/// @dev The `old` param will tell this function to return newly updated user data or the old one
export const update_user_info = async (
  user_address: string,
  amount: string,
  referBy: string,
  old?: boolean,
  withdraw?: boolean,
): Promise<IUserModel> => {
  //@dev Retrieve user current info by user's address
  let current_user = await retrieve_user(user_address);
  let old_current_user = current_user.toObject();

  //@dev Check if user join the staking program by referral. If yes, create
  // the referrer in the db
  if (
    current_user.referralBy === ethers.constants.AddressZero &&
    referBy != ethers.constants.AddressZero
  ) {
    await retrieve_user(referBy);
    await update_referral_tree_path(user_address, referBy);
    //
    current_user.referralBy = referBy;
  }

  // Update current deposit amount
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

  // @dev: check the current staking interest of user
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

  // Update user into the database
  await current_user.save();

  // Return the newly updated user or the old one.
  return old ? (old_current_user as any) : current_user;
};

/// @title Update user Referral Tree Path
/// @author Arthur Nguyen
/// @dev (I'm using Closure Table Mechanism for storing this data). Cuz the Referral Depth Level is Unknown
export const update_referral_tree_path = async (
  user_addr: string,
  referrer: string,
) => {
  let ancestor_descendants: Document[] = [];

  // Find all ancestor of the referrer because if an user is descendant to the referrer,
  // it also be descendant to referrer's ancestor as well.
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

  // Insert all updated into the db
  await UserTreePath.insertMany(ancestor_descendants);
};

/// @title Update Referral Tree due to user's current deposit has changed.
/// @author Arthur Nguyen
export const update_user_branches = async (
  user: IUserModel, // Old user details
  amount: string,
  timestamp: number,
) => {
  // @dev: Find all user's ancestor by user._id (user's address)
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

  // Get User Data Trie (Patricia Trie) For faster query
  let user_data_trie = await get_user_data_trie();

  // Check if there're any ancestor exists.
  // @dev: user_ancestors.length > 1 cuz the query will also returns the default user tree path of that user
  // (user's ancestor and descendant is user themselves)
  if (user_ancestors.length && user_ancestors.length > 1 && user_data_trie) {
    //@dev Get newest current user details cuz the query above return included the default case
    let newest_current_user = user_ancestors[0].ancestor;

    let trie = user_data_trie.trie;
    // let users_level_after_modify = {};

    //@dev  Need to slice the first element to remove current user from list of ancestors
    user_ancestors = user_ancestors.slice(1);

    // Insert current level and staking interest rate into user data trie for further query
    trie = upsert_new_node(trim_0x_in_address(newest_current_user._id), trie, {
      // current_level: current_level,
      interest_rate: newest_current_user.interest_rate,
      total_deposit_amount: newest_current_user.current_deposit,
    });

    //@dev: Loop through all user's ancestor entries
    for (let [index, user_ancestor] of user_ancestors.entries()) {
      let { ancestor, path_length } = user_ancestor;
      let {
        branches,
        accumulative_index,
        last_accrued_timestamp,
        total_global_reward,
        global_interest_rate,
        global_interest_rate_disabled,
        accumulative_index_by_branch,
        disable_branches,
        descendants_passing_level,
      } = ancestor;

      //@dev: Find F1_address of the current ancestor
      let F1_branch_address =
        path_length > 1 ? user_ancestors[index - 1].ancestor._id : user._id;

      //@dev: Increase total deposit amount fo that branch
      let current_branch_staking = branches[F1_branch_address] || "0";
      branches[F1_branch_address] = new BigNumber(current_branch_staking)
        .plus(new BigNumber(amount).div(1e18))
        .toString();

      //@dev Calculate ancestor current global rewards from the last time accumulated till the event timestamp
      let {
        total_global_reward: updated_total_global_reward,
        last_accrued_timestamp: updated_last_accrued_timestamp,
      } = calculate_total_global_rewards(
        accumulative_index,
        total_global_reward,
        // Check if all branch has been disabled,
        // then global_interest_rate equals 0, otherwise will be the default
        global_interest_rate_disabled === true ? 0 : global_interest_rate,
        last_accrued_timestamp,
        timestamp,
      );

      // Retrieve ancestor current level
      let current_level = await get_user_current_level(
        user_data_trie,
        branches,
      );

      // @dev: Retrieve all ancestor descendants
      const ancestor_descendants = await retrieve_user_descendants_by_addr(
        ancestor._id,
      );

      // @dev: Update passing level reward if possible
      const {
        updated_total_global_reward:
          updated_total_global_reward_after_level_passing,
        updated_descendants_passing_level,
      } = await try_distribute_level_passing_rewards(
        descendants_passing_level,
        ancestor._id,
        current_level,
        ancestor_descendants,
        new BigNumber(updated_total_global_reward),
        accumulative_index_by_branch,
        // new BigNumber(accumulative_index),
      );

      descendants_passing_level = updated_descendants_passing_level;
      updated_total_global_reward =
        updated_total_global_reward_after_level_passing;

      let { updated_accumulative_index, accumulative_index_diff } =
        await try_update_accumulative_index(
          user,
          newest_current_user,
          accumulative_index,
        );

      // Update Accumulative index diff for each branch
      accumulative_index_by_branch[F1_branch_address] = new BigNumber(
        accumulative_index_by_branch[F1_branch_address] || "0",
      )
        .plus(accumulative_index_diff)
        .toString();

      // @dev: Check breaking rules of all ancestor's branches
      const {
        updated_accumulative_index: new_updated_accumulative_index,
        disable_branches: updated_disable_branches,
        global_interest_rate_disabled: updated_global_interest_rate_disabled,
      } = await try_check_break_branch_rules(
        F1_branch_address,
        ancestor_descendants,
        current_level,
        accumulative_index_diff,
        accumulative_index_by_branch,
        updated_accumulative_index, // Use the latest accumulative index
        disable_branches,
      );

      global_interest_rate_disabled = updated_global_interest_rate_disabled;
      updated_accumulative_index = new_updated_accumulative_index;
      disable_branches = updated_disable_branches;

      // Insert current level and staking interest rate into user data trie for further query
      trie = upsert_new_node(trim_0x_in_address(ancestor._id), trie, {
        current_level,
        // interest_rate: ancestor.interest_rate,
        // total_deposit_amount: ancestor,
      });

      let user_global_referral_interest_rate =
        UserLevelGlobalInterest[current_level];

      // users_level_after_modify[ancestor._id] = {
      //   global_interest_rate: user_global_referral_interest_rate,
      //   current_level,
      //   branches,
      //   last_accrued_timestamp: updated_last_accrued_timestamp,
      //   total_global_reward: updated_total_global_reward,
      //   accumulative_index: updated_accumulative_index.toFixed(),
      //   disable_branches,
      //   accumulative_index_by_branch,
      //   global_interest_rate_disabled,
      //   descendants_passing_level,
      // };

      await User.findOneAndUpdate(
        {
          _id: ancestor._id,
        },
        {
          global_interest_rate: user_global_referral_interest_rate,
          level: current_level,
          branches,
          last_accrued_timestamp: updated_last_accrued_timestamp,
          total_global_reward: updated_total_global_reward,
          accumulative_index: updated_accumulative_index.toString(),
          disable_branches,
          accumulative_index_by_branch,
          global_interest_rate_disabled,
          descendants_passing_level,
        },
        {
          upsert: true,
        },
      );
    }

    // await User.bulkWrite(
    //   Object.keys(users_level_after_modify).map((ancestor_address) => {
    //     const {
    //       current_level,
    //       total_global_reward,
    //       global_interest_rate,
    //       branches,
    //       accumulative_index,
    //       last_accrued_timestamp,
    //       disable_branches,
    //       accumulative_index_by_branch,
    //       global_interest_rate_enabled,
    //       descendants_passing_level,
    //     } = users_level_after_modify[ancestor_address];
    //     return {
    //       updateOne: {
    //         filter: { _id: ancestor_address },
    //         update: {
    //           level: current_level,
    //           branches,
    //           global_interest_rate,
    //           total_global_reward,
    //           accumulative_index,
    //           last_accrued_timestamp,
    //           disable_branches,
    //           accumulative_index_by_branch,
    //           global_interest_rate_enabled,
    //           descendants_passing_level,
    //         },
    //         upsert: true,
    //       },
    //     };
    //   }),
    // );

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

function try_distribute_level_passing_rewards(
  descendants_passing_level: DescendantPassingLevel,
  ancestor_address: string,
  ancestor_level: UserLevel,
  ancestor_descendants: any[],
  ancestor_total_global_reward: BigNumber,
  accumulative_index_by_branch: Map<string, string>,
): {
  updated_descendants_passing_level: DescendantPassingLevel;
  updated_total_global_reward: string;
} {
  let accumulative_index = new BigNumber(0);

  Object.keys(accumulative_index_by_branch).map((F1_branch_address) => {
    // if (ancestor_address === "0x202a7eb1435CDb9bED88D72003fE518D56c060C5") {
    //   console.log("ZALO: ", accumulative_index_by_branch[F1_branch_address]);
    // }
    accumulative_index = accumulative_index.plus(
      new BigNumber(accumulative_index_by_branch[F1_branch_address]),
    );
  });

  let ancestor_updated_total_global_reward = ancestor_total_global_reward;

  for (let ancestor_descendant of ancestor_descendants) {
    let descendant = ancestor_descendant.descendant;
    if (
      UserLevelGlobalInterest[descendant.level] >
      UserLevelGlobalInterest[ancestor_level]
    ) {
      let descendant_previous_passing_level =
        descendants_passing_level[ancestor_address];

      let alreadyRewarded =
        descendant_previous_passing_level?.descendant_level ===
          descendant.level &&
        descendant_previous_passing_level?.ancestor_level === ancestor_level;

      if (!alreadyRewarded) {
        ancestor_updated_total_global_reward = new BigNumber(
          ancestor_updated_total_global_reward,
        ).plus(
          accumulative_index
            .multipliedBy(new BigNumber(USER_LEVEL_PASSED_INTEREST))
            .div(10000),
        );

        descendants_passing_level[descendant._id] = {
          descendant_level: descendant.level,
          ancestor_level: ancestor_level,
        };
      }
    }
  }

  return {
    updated_total_global_reward:
      ancestor_updated_total_global_reward.toString(),
    updated_descendants_passing_level: descendants_passing_level,
  };
}

async function try_check_break_branch_rules(
  F1_branch_address,
  ancestor_descendants: any[],
  ancestor_level: UserLevel,
  accumulative_index_diff: BigNumber,
  accumulative_index_by_branch: Map<string, number>,
  accumulative_index: BigNumber,
  disable_branches: Map<string, boolean>,
): Promise<{
  global_interest_rate_disabled: boolean;
  updated_accumulative_index: BigNumber;
  disable_branches: Map<string, boolean>;
}> {
  //@dev: This mapping will be used to map descendants to their data (
  // depth level + referBy) in user referral tree by path_length
  let descendant_to_path_length = {};
  //@dev: This mapping will be used to mark if any branches has violated the rule
  let ancestor_F1_address_branch_break_rule = {};
  //@dev: Global interest will be disabled if all branches has violated rules
  let global_interest_rate_disabled = false;
  // Total ancestor F1s
  let total_F1s = 0;

  for (let ancestor_descendant of ancestor_descendants) {
    // Get all ancestor F1s
    if (ancestor_descendant.path_length === 1) {
      ancestor_F1_address_branch_break_rule[
        ancestor_descendant.descendant._id
      ] = false;
      total_F1s++;
    }

    descendant_to_path_length[ancestor_descendant.descendant._id] = {
      path_length: ancestor_descendant.path_length,
      referralBy: ancestor_descendant.descendant.referralBy,
    };
  }

  // Loop through all ancestor descendants to find if any descendant violate the rule
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

    //@dev: Find out if in branches that has an user whose level
    // more than the ancestor -> disable that branch
    if (
      UserLevelGlobalInterest[descendant.level] >=
      UserLevelGlobalInterest[ancestor_level]
    ) {
      ancestor_F1_address_branch_break_rule[F1_address] = true;
    }
  }

  let updated_accumulative_index = accumulative_index;

  //@dev: Looping through all F1 that has break the rule
  Object.keys(ancestor_F1_address_branch_break_rule).map((F1_address) => {
    const break_rule = ancestor_F1_address_branch_break_rule[F1_address];
    //@dev: If the branch hasn't violated but now violated -> list it to disable branches

    if (disable_branches[F1_address] && !break_rule) {
      disable_branches[F1_address] = false;
      updated_accumulative_index = updated_accumulative_index.plus(
        new BigNumber(accumulative_index_by_branch[F1_address]).minus(
          F1_address === F1_branch_address ? accumulative_index_diff : "0",
        ),
      );
    }

    if (
      disable_branches[F1_address] &&
      break_rule &&
      F1_address === F1_branch_address
    ) {
      // @dev: In both case user deposit and withdraw tokens, we must subtract the diff from updated_accumulative_index
      updated_accumulative_index = updated_accumulative_index.minus(
        accumulative_index_diff,
      );
    }

    // subtract it from accumulative index as well
    if (!disable_branches[F1_address] && break_rule) {
      disable_branches[F1_address] = true;

      updated_accumulative_index = updated_accumulative_index.minus(
        new BigNumber(accumulative_index_by_branch[F1_address]),
      );
    }
  });

  // Check if all F1 branch has been disabled
  if (Object.keys(ancestor_F1_address_branch_break_rule).length === total_F1s) {
    global_interest_rate_disabled = true;
  }

  return {
    global_interest_rate_disabled,
    updated_accumulative_index,
    disable_branches,
  };
}

async function try_update_accumulative_index(
  old_user,
  newest_current_user,
  accumulative_index,
): Promise<{
  updated_accumulative_index: BigNumber;
  accumulative_index_diff: BigNumber;
}> {
  let updated_accumulative_index;
  let accumulative_index_diff;

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
  );
  updated_accumulative_index = updated_accumulative_index.gt(0)
    ? updated_accumulative_index
    : new BigNumber(0);
  // }

  return { updated_accumulative_index, accumulative_index_diff };
}
