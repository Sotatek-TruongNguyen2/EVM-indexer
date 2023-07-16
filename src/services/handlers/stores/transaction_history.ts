import { TransactionHistory } from "../models/transaction-history.model";
import { ITransactionHistory } from "../types/ITransactionHistory";

export const save_tx = async (tx: ITransactionHistory) => {
  let tx_history = new TransactionHistory(tx);

  try {
    await TransactionHistory.findOneAndUpdate(
      {
        $and: [{ tx_hash: tx.tx_hash }, { category: tx.category }],
      },
      {
        $set: {
          tx_hash: tx_history.tx_hash,
          amount: tx_history.amount,
          block_number: tx_history.block_number,
          category: tx_history.category,
          referrer: tx_history.referrer,
          sender: tx_history.sender,
          timestamp: tx_history.timestamp,
          user: tx_history.user,
        },
      },
      {
        upsert: true,
        new: true,
      },
    );
  } catch (err) {
    throw new Error("Transaction history can't be upserted !!");
  }
};
