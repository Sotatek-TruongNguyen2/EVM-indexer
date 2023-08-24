import { Logger } from "winston";
import {
  IEthereumBlockCleanerModel,
  EthereumBlockCleaner,
} from "../../models/ethereum-block-cleaner.model";
import { EthereumBlocks } from "../../models/ethereum-block.model";
import { ChainHeadPtr } from "../../types";

export const instantiate_block_cleaner = async (
  chain_id: number,
  chain_head_ptr: ChainHeadPtr | undefined,
): Promise<IEthereumBlockCleanerModel> => {
  let ethereum_block_cleaner = await EthereumBlockCleaner.findOne({
    chain_id,
  });

  if (!ethereum_block_cleaner) {
    let inserted_ethereum_block_cleaner = new EthereumBlockCleaner({
      chain_id,
      latest_clean_block_number: chain_head_ptr?.number,
      non_fatal_errors: [],
      total_cleaned_blocks: 0,
    });

    ethereum_block_cleaner = await inserted_ethereum_block_cleaner.save();
  }

  return ethereum_block_cleaner;
};

export const retrieve_block_cleaner = async (
  chain_id: number,
): Promise<IEthereumBlockCleanerModel | null> => {
  let ethereum_block_cleaner = await EthereumBlockCleaner.findOne({
    chain_id,
  });

  return ethereum_block_cleaner;
};

export const update_latest_cleaned_block = async (
  chain_id: number,
  latest_clean_block_number: number,
  logger: Logger,
) => {
  await EthereumBlockCleaner.findOneAndUpdate(
    {
      chain_id,
    },
    {
      $set: {
        latest_clean_block_number,
      },
    },
  );

  logger.debug(
    `Update latest cleaned block number of BlockCleaner ${chain_id} to ${latest_clean_block_number}`,
  );
};

export const clean_logs_for_block_range = async (
  chain_id: number,
  number_of_blocks_to_clean: number,
  logger: Logger,
) => {
  try {
    let block_cleaner = await retrieve_block_cleaner(chain_id);
    if (number_of_blocks_to_clean > 0 && block_cleaner) {
      let end_block_to_clean =
        block_cleaner.latest_clean_block_number + number_of_blocks_to_clean - 1;

      await EthereumBlocks.updateMany(
        {
          $and: [
            {
              block_number: {
                $gte: block_cleaner.latest_clean_block_number,
              },
            },
            {
              block_number: {
                $lte: end_block_to_clean,
              },
            },
          ],
        },
        {
          $set: {
            "data.logs": [],
          },
        },
      );

      logger.debug(
        `Clean old logs from blocks [${block_cleaner.latest_clean_block_number}, ${end_block_to_clean}]" <-> range_size => ${number_of_blocks_to_clean}`,
      );

      await EthereumBlockCleaner.updateOne(
        {
          $and: [{ chain_id: `${chain_id}` }],
        },
        {
          $set: {
            latest_clean_block_number: end_block_to_clean,
            total_cleaned_blocks:
              block_cleaner.total_cleaned_blocks + number_of_blocks_to_clean,
          },
        },
      );

      logger.debug(
        `Update Latest Block Cleaner to block number ${end_block_to_clean}`,
      );

      return;
    }

    logger.debug(`Nothing to clear now !! We're good with the disks.`);
  } catch (err: any) {
    logger.error("Error when trying to clear to old logs: ", err.message);
  }
};
