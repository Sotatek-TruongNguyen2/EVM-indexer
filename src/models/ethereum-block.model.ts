import mongoose, { Document } from "mongoose";

export interface IEthereumBlock extends Document {
  finalized: boolean;
  data: any;
  timestamp: number;
  block_hash: string;
  block_number: number;
  parent_hash: string;
  network_name: string;
  chain_id: number;
}

const EthereumBlockSchema = new mongoose.Schema({
  finalized: {
    type: Boolean,
    required: true,
  },
  data: {
    type: Object,
    required: true,
  },
  block_hash: {
    type: String,
    required: true,
    index: true,
  },
  block_number: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Number,
    required: true,
  },
  parent_hash: {
    type: String,
    required: true,
  },
  network_name: {
    type: String,
    required: true,
  },
  chain_id: {
    type: Number,
    required: true,
  },
});

export const EthereumBlocks = mongoose.model<IEthereumBlock>(
  "EthereumBlock",
  EthereumBlockSchema,
);
