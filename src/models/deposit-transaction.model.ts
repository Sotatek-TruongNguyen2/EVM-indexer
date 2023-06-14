import mongoose from 'mongoose';

const ContractDeploymentSchema = new mongoose.Schema({
  latestEthereumBlockHash: String,
  latestEthereumBlockNumber: Number,
  synced: Boolean,
  non_fatal_errors: [String],
  fatal_error: {
    type: String,
    required: false,
  },
});

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

export const ContractDeployment = mongoose.model(
  'ContractDeployment',
  ContractDeploymentSchema,
);

console.log(ContractDeployment);
