import mongoose, { Document } from "mongoose";

export interface IEthereumBlockCleanerModel extends Document {
  _id: string;
  non_fatal_errors: string[];
  total_cleaned_blocks: number;
  latest_clean_block_number: number;
  chain_id: number;
}

const EthereumBlockCleanerSchema = new mongoose.Schema({
  chain_id: {
    type: Number,
    required: true,
  },
  total_cleaned_blocks: {
    type: Number,
    required: true,
    default: 0,
  },
  non_fatal_errors: {
    type: [String],
    required: true,
    default: [],
  },
  latest_clean_block_number: {
    type: Number,
    required: true,
    index: true,
  },
});

export const EthereumBlockCleaner = mongoose.model<IEthereumBlockCleanerModel>(
  "EthereumBlockCleaner",
  EthereumBlockCleanerSchema,
);
