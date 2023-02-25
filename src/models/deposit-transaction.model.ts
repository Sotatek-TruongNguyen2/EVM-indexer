import mongoose from 'mongoose';

/**
 * Mongoose schema for transaction
 */
const DepositTransactionSchema = new mongoose.Schema({
  txnHash: String,
  user: String,
  amount: String,
  pid: Number,
  timestamp: Number,
  block: Number,
});

export const TransferTransaction = mongoose.model(
  'DepositTransaction',
  DepositTransactionSchema,
);
