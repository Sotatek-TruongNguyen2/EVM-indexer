import BigNumber from "bignumber.js";
import { UserLevel } from "../constants";
import { IUserDataTrie, UserDataTrie } from "../models/trie";
import { EnvironmentConfig } from "../../../config/env";

export const upsert_new_node = (
  str: string,
  node,
  data?: any,
  //   level?: UserLevel,
  //   interest_rate?: number,
) => {
  if (str.length === 0) {
    node.data = Object.assign(node.data || {}, data);
    node.end = true;
    return node;
  }

  if (!node.keys[str[0]]) {
    node.keys[str[0]] = { keys: {} };
    node.keys[str[0]] = upsert_new_node(
      str.substring(1),
      node.keys[str[0]],
      data,
    );
  } else {
    node.keys[str[0]] = upsert_new_node(
      str.substring(1),
      node.keys[str[0]],
      data,
    );
  }

  return node;
};

export const get_user_level_by_address = (
  addr: string,
  node: any,
): UserLevel => {
  if (!node) {
    return UserLevel.UNKNOWN;
  }

  let available = true;
  let immediate_node;

  for (let c of addr) {
    if (!node.keys[c]) {
      return UserLevel.UNKNOWN;
    }

    immediate_node = node.keys[c];
  }

  if (available && immediate_node && immediate_node.end) {
    return immediate_node.data.level;
  }

  return UserLevel.UNKNOWN;
};

export const get_user_data_trie = async (): Promise<
  IUserDataTrie | undefined
> => {
  let user_data_trie = await UserDataTrie.find({});
  return user_data_trie ? user_data_trie[0] : undefined;
};

export const upsert_user_data = async (
  user_addr: string,
  data?: any,
  //   level?: UserLevel,
  //   global_interest_rate?: number,
) => {
  const user_data_trie = await get_user_data_trie();

  const address_without_0x = user_addr.substring(2);

  let default_root_trie = { keys: {}, data: {}, end: false };
  let trie = user_data_trie ? user_data_trie.trie : default_root_trie;

  trie = upsert_new_node(address_without_0x, trie, data);

  await UserDataTrie.findByIdAndUpdate(
    user_data_trie ? user_data_trie._id : 1,
    {
      $set: {
        trie,
      },
    },
    {
      upsert: true,
    },
  );
};

export const get_level_by_user_addresses = async (
  user_data_trie: IUserDataTrie | undefined,
  user_addresses: string[],
): Promise<UserLevel[]> => {
  let levels: UserLevel[] = [];

  if (!user_data_trie) {
    return levels;
  }

  for (let addr of user_addresses) {
    levels.push(get_user_level_by_address(addr, user_data_trie.trie));
  }

  return levels;
};

export const get_user_current_level = async (
  user_data_trie: IUserDataTrie | undefined,
  branches: Map<string, string>,
): Promise<UserLevel> => {
  const environment_config = EnvironmentConfig.getInstance();
  const branch_types = {};
  let unknown_branches_staking = "0";

  const F1_addresses = Object.keys(branches);
  const F1_levels = await get_level_by_user_addresses(
    user_data_trie,
    F1_addresses,
  );

  if (F1_addresses.length > 0 && F1_addresses.length === F1_levels.length) {
    for (let [index, F1_address] of F1_addresses.entries()) {
      // Count how many F1 levels already have
      branch_types[F1_levels[index]] +=
        (branch_types[F1_levels[index]] || 0) + 1;
      if (F1_levels[index] === UserLevel.UNKNOWN) {
        unknown_branches_staking = new BigNumber(unknown_branches_staking)
          .plus(
            new BigNumber(branches[F1_address]).gt(
              environment_config.MAXIMUM_BRANCH_STAKING,
            )
              ? new BigNumber(environment_config.MAXIMUM_BRANCH_STAKING)
              : new BigNumber(branches[F1_address]),
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

    // console.log(
    //   "zxczxcx: ",
    //   unknown_branches_staking,
    //   environment_config.SHAPPIRE_LEVEL_STAKING_CONDITION,
    // );

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
