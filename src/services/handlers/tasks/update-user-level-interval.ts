import { Logger } from "winston";
import { User } from "../models/user.model";

export const update_user_level_interval = (logger: Logger) => {
  var cron = require("node-cron");

  cron.schedule("*/5 * * * *", () => {
    logger.info(
      `Running task ${update_user_level_interval.name} every 5 minutes!`,
    );

    const cursor = User.find({});
  });
};
