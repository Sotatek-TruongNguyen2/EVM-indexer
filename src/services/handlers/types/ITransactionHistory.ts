import { TransactionCategory } from "../constants/transaction-category";

export interface ITransactionHistory {
  tx_hash: string;
  category: TransactionCategory;
  block_number: number;
  timestamp: number;
  sender: string;
  user: string;
  referrer: string;
  amount: number;
}
