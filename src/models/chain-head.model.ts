import mongoose from "mongoose";

export const ChainStoreSchema = new mongoose.Schema({
  head_block_hash: {
    type: String,
    required: true,
  },
  head_block_number: {
    type: Number,
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

export const ChainHeadStore = mongoose.model("ChainStore", ChainStoreSchema);
