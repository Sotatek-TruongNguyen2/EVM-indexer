import mongoose, { Document } from "mongoose";
import { ethers } from "ethers";
import { TransactionCategory } from "../constants/transaction-category";

export interface ITransactionHistoryDocument extends Document {
  tx_hash: string;
  category: TransactionCategory;
  block_number: number;
  timestamp: number;
  user: string;
  sender: string;
  referrer: string;
  amount: number;
}

export const TransactionHistorySchema = new mongoose.Schema({
  tx_hash: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: TransactionCategory,
    default: TransactionCategory.UNKNOWN,
  },
  block_number: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Number,
    required: true,
  },
  user: {
    type: String,
    required: true,
  },
  sender: {
    type: String,
    required: true,
  },
  amount: {
    type: String,
    required: true,
  },
  referrer: {
    type: String,
    required: true,
    default: ethers.constants.AddressZero,
  },
});

export const TransactionHistory = mongoose.model(
  "TransactionHistory",
  TransactionHistorySchema,
);
