import mongoose, { Document } from "mongoose";
import { SECONDS_IN_DAY_IN_MILLISECONDS, UserLevel } from "../constants";

export interface IBranchStaking extends Document {
  total_staking: string;
  type: string;
}

export interface IUserModel extends Document {
  _id: string;
  current_deposit: string;
  referralBy: string;
  branches: Map<string, string>;
  level: string;
  interest_rate: number;
  global_interest_rate: number;
  accumulative_index: number;
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
    index: {
      unique: true,
    },
  },
  // address: {
  //   type: String,
  //   required: true,
  //   index: {
  //     unique: true,
  //   },
  // },
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
  accumulative_index: {
    type: Number,
    required: true,
    default: 0,
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
});

UserModelSchema.methods.referralInvitationByLevel = function (
  level: number,
): Map<string, boolean> {
  return this[`F${level}`];
};
export const User = mongoose.model("User", UserModelSchema);
