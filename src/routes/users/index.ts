import express from "express";
import { User } from "../../services/handlers/models/user.model";
import { get_user_current_level } from "../../helpers/get_user_current_level";
import { RedisConnection } from "../../caching/redis";
import { UserLevel } from "../../services/handlers/constants";
import { ethers } from "ethers";

const routes = express.Router();
const USER_LEVEL_PREFIX = "USER_LEVEL";

routes.route("/level/:address").get(async function (req, res) {
  const { address } = req.params;

  const redis_client = RedisConnection.getClient();
  const current_level_cached = await redis_client.get(
    `${USER_LEVEL_PREFIX}_${address}`,
  );

  if (current_level_cached) {
    res.status(200).send({
      level: current_level_cached,
      address,
    });
    return;
  }

  let user = await User.findOne({
    address: {
      $eq: address,
    },
  });

  let user_current_level = UserLevel.UNKNOWN;

  if (user) {
    user_current_level = await get_user_current_level(user.branches);

    if (user.level !== user_current_level) {
      await User.updateOne(
        {
          address,
        },
        {
          $set: {
            level: user_current_level,
          },
        },
        {
          new: true,
        },
      );
    }

    // will cached the current user level in 5 minutes
    await redis_client.setex(
      `${USER_LEVEL_PREFIX}_${address}`,
      300,
      user_current_level,
    );
  }

  res.status(200).send({
    level: user_current_level,
    // branches: user ? Object.fromEntries(user.branches) : {},
    // referralBy: user?.referralBy || ethers.constants.AddressZero,
    // current_deposit: user?..current_deposit || "0",
    address,
  });
});

export { routes as user_routes };
