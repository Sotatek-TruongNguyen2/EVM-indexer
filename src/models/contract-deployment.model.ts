import mongoose, { Document } from "mongoose";

export interface ITriggerFilters {
  [hash: string]: { eventName: string };
}
export interface IContractDeployment extends Document {
  deployment: string;
  contract: string;
  chain_id: number;
  latest_ethereum_block_hash: string | null;
  latest_ethereum_block_number: number | null;
  oldest_ethereum_block: number | null;
  synced: boolean;
  non_fatal_errors: [string];
  fatal_error: string | null;
  filters: ITriggerFilters;
  handlers: Map<string, string>;
}

const ContractDeploymentSchema = new mongoose.Schema({
  deployment: String,
  filters: {
    type: Object,
    required: true,
  },
  contract: {
    type: String,
    required: true,
  },
  chain_id: {
    type: Number,
    required: true,
  },
  latest_ethereum_block_hash: {
    type: String,
    required: false,
  },
  latest_ethereum_block_number: {
    type: Number,
    required: false,
  },
  handlers: {
    type: Map,
    of: String,
    required: true,
  },
  // oldest_ethereum_block_number: {
  //   type: Number,
  //   required: false,
  // },
  // oldest_ethereum_block_hash: {
  //   type: String,
  //   required: false,
  // },
  synced: Boolean,
  non_fatal_errors: [String],
  fatal_error: {
    type: String,
    required: false,
  },
});

export const ContractDeployment = mongoose.model(
  "ContractDeployment",
  ContractDeploymentSchema,
);
