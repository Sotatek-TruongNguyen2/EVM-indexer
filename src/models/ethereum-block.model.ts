import mongoose from "mongoose";

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
  },
  block_number: {
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

export const EthereumBlocks = mongoose.model(
  "EthereumBlock",
  EthereumBlockSchema,
);
