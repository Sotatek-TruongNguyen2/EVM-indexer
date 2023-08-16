import mongoose, { Document, Schema } from "mongoose";
import { UserLevel } from "../constants";

export type DescendantPassingLevel = Map<
  string,
  { descendant_level: string; ancestor_level: string }
>;

export interface IUserModel extends Document {
  _id: string;
  current_deposit: string;
  referralBy: string;
  branches: Map<string, string>;
  level: string;
  interest_rate: number;
  global_interest_rate: number;
  accumulative_index: string;
  accumulative_index_by_branch: Map<string, string>;
  descendants_passing_level: DescendantPassingLevel;
  disable_branches: Map<string, boolean>;
  global_interest_rate_disabled: boolean;
  last_accrued_timestamp: number;
  total_global_reward: string;
}

export const BranchStaking = new mongoose.Schema(
  {
    total_staking: {
      type: String,
      required: true,
      default: "0",
    },
    // type: {
    //   type: String,
    //   enum: UserLevel,
    //   default: UserLevel.UNKNOWN,
    // },
  },
  { _id: false },
);

export const UserModelSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  level: {
    type: String,
    enum: UserLevel,
    default: UserLevel.UNKNOWN,
  },
  referralBy: {
    type: String,
    required: true,
  },
  current_deposit: {
    type: String,
    required: true,
    default: "0",
  },
  branches: {
    type: Map,
    of: String,
    default: {},
  },
  interest_rate: {
    type: Number,
    required: true,
    default: 0,
  },
  global_interest_rate: {
    type: Number,
    required: true,
    default: 0,
  },
  global_interest_rate_disabled: {
    type: Boolean,
    required: true,
    default: false,
  },
  accumulative_index: {
    type: String,
    required: true,
    default: 0,
  },
  disable_branches: {
    type: Map,
    of: Boolean,
    default: {},
  },
  accumulative_index_by_branch: {
    type: Map,
    of: String,
    default: {},
  },
  last_accrued_timestamp: {
    type: Number,
    required: true,
    default: 0,
  },
  total_global_reward: {
    type: String,
    required: true,
    default: 0,
  },
  descendants_passing_level: {
    type: Map,
    of: new Schema({
      descendant_level: {
        type: String,
        enum: UserLevel,
        default: UserLevel.UNKNOWN,
      },
      ancestor_level: {
        type: String,
        enum: UserLevel,
        default: UserLevel.UNKNOWN,
      },
    }),
    default: {},
  },
});

UserModelSchema.methods.referralInvitationByLevel = function (
  level: number,
): Map<string, boolean> {
  return this[`F${level}`];
};
export const User = mongoose.model("User", UserModelSchema);
