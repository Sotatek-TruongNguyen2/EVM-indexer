import { Block } from "@ethersproject/abstract-provider";
import { BigNumber, ethers } from "ethers";
import {
  ContractDeployment,
  IContractDeployment,
} from "../../models/contract-deployment.model";
import { ChainConfig } from "../../config/chainConfig";
import { getIndexerLogger } from "../../utils/logger";
import { IndexerConfig } from "../../config/indexer";
import { callRPCMethod } from "../../utils/rpcRequest";
import { Document, ObjectId } from "mongoose";
import { BlockPtr } from "../../types";

export type Deployment = {
  id: ObjectId;
  deployment: string;
};

export const set_synced = async (deployment_id: string, synced?: boolean) => {
  let updated_row = await ContractDeployment.updateOne(
    {
      _id: { $eq: deployment_id },
    },
    {
      $set: {
        synced,
      },
    },
    {
      new: true,
    },
  );

  if (!updated_row) {
    throw new Error(`Deployment ID ${deployment_id} not found!`);
  }
};

export const update_latest_ethereum_block = async (
  deployment_id: string,
  block: BlockPtr,
) => {
  // const deployment = await ContractDeployment.find({
  //   $gt
  //   // $and: [
  //   //   {'_id': deployment_id},
  //   //   {'latest_ethereum_block_number'}
  //   // ]
  //   // $
  // });
  let updated_row = await ContractDeployment.updateOne(
    {
      _id: { $eq: deployment_id },
      $or: [
        {
          latest_ethereum_block_number: { $lt: block.number },
        },
        {
          latest_ethereum_block_number: { $eq: null },
        },
      ],
    },
    {
      $set: {
        latest_ethereum_block_hash: block.hash,
        latest_ethereum_block_number: block.number,
      },
    },
  );

  // console.log("UPDATED ROW: ", updated_row);

  if (!updated_row) {
    throw new Error(`Deployment ID ${deployment_id} not found!`);
  }
};

export const get_all_deployments = async (): Promise<
  Array<IContractDeployment>
> => {
  const deployments: Array<IContractDeployment> = await ContractDeployment.find(
    {},
  );
  return deployments;
};

export const get_deployment_latest_block = async (
  id: String,
): Promise<BlockPtr | undefined> => {
  const deployment = await ContractDeployment.findById(id);
  if (!deployment) {
    return;
  }
  return {
    hash: deployment.latest_ethereum_block_hash as string,
    number: deployment.latest_ethereum_block_number as number,
  };
};

export const save_contract_deployments = async () => {
  let mongo_prepared_deployments: {
    deployment_doc: Document;
    metadata: {
      id: number;
      name: string;
      contract: string;
      deployment_hash: string;
      start_block: number | null;
      oldest_block: number | null;
    };
  }[] = [];

  Object.keys(ChainConfig).map((key) => {
    let { deployments, id, name } = ChainConfig[key];
    deployments.map((deployment) => {
      let logger = getIndexerLogger(`saveDeployment_${name}`);
      logger.debug(
        `proceeding to process saving all instantiate contract deployments!`,
      );

      const contract_deployment_hash = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes(
          `${id}-${deployment.contract}-${deployment.startBlock}-${deployment.oldestBlock}-${deployment.filters}`,
        ),
      );

      console.log("hash: ", contract_deployment_hash);

      logger.debug(
        `proceeding to process saving contract deployment with ChainId = ${id}, Contract Address = ${deployment.contract}, Deployment Hash = ${contract_deployment_hash}`,
      );

      let indexer_config = IndexerConfig.getInstance();
      let start_block: { hash: String | null; number: Number | null } = {
        hash: null,
        number: null,
      };

      // override if we have GRAPH_START_BLOCK in the environment
      if (indexer_config.GRAPH_START_BLOCK) {
        let graph_start_block = indexer_config.GRAPH_START_BLOCK.split(":");
        start_block = {
          hash: graph_start_block[0],
          number: Number(graph_start_block[1]),
        };
      }

      const handler_mapping = new Map();

      for (let handler_topic of Object.keys(deployment.handlers)) {
        if (!handler_mapping.get(handler_topic)) {
          handler_mapping.set(
            handler_topic,
            deployment.handlers[handler_topic],
          );
        }
      }

      const contract_deployment = new ContractDeployment({
        non_fatal_errors: [],
        chain_id: id,
        contract: deployment.contract,
        fatal_error: null,
        latest_ethereum_block_hash: start_block?.hash,
        latest_ethereum_block_number: start_block?.number,
        // oldest_ethereum_block_number: null,
        synced: false,
        deployment: contract_deployment_hash,
        filters: deployment.filters,
        abi: deployment.abi,
        handlers: handler_mapping,
      });

      mongo_prepared_deployments.push({
        deployment_doc: contract_deployment,
        metadata: {
          id: id,
          name: name,
          contract: deployment.contract,
          deployment_hash: contract_deployment_hash,
          oldest_block: deployment.oldest_block,
          start_block: deployment.start_block,
        },
      });
    });
  });

  for (let deployment of mongo_prepared_deployments) {
    const { metadata, deployment_doc } = deployment;
    let logger = getIndexerLogger(`saveDeployment_${metadata.name}`);
    logger.debug(
      `proceeding to process saving all instantiate contract deployments!`,
    );
    try {
      const existing = await ContractDeployment.findOne({
        deployment: metadata.deployment_hash,
      });

      if (!existing) {
        if (metadata.start_block) {
          let start_block = await callRPCMethod(metadata.id, "getBlock", [
            metadata.start_block - 1,
          ]);

          deployment_doc.set("latest_ethereum_block_hash", start_block.hash);
          deployment_doc.set(
            "latest_ethereum_block_number",
            BigNumber.from(start_block.number).toNumber(),
          );
        }
        await deployment_doc.save();
        logger.info(
          `Saving contract deployment with ChainId = ${metadata.id}, Contract Address = ${metadata.contract} successfully!!! 😁😁😁`,
        );
        continue;
      }

      logger.info(
        `Contract deployment with deployment hash = ${metadata.deployment_hash} already existed!`,
      );
    } catch (err: any) {
      logger.error(err.message);
      logger.error(
        `Failed to save contract deployment with deployment hash = ${metadata.deployment_hash}`,
      );
    }
  }
};
