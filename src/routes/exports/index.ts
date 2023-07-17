import express from "express";
import { GoogleAuth } from "google-auth-library";
import { google } from "googleapis";
import xl from "excel4node";
import fs from "fs";
import { User } from "../../services/handlers/models/user.model";
import { UserLevel } from "../../services/handlers/constants";
import { calculate_total_global_rewards } from "../../helpers/calculate_total_global_rewards";
import { BigNumber } from "bignumber.js";

const routes = express.Router();

routes.route("/users").post(async function (req, res) {
  let users = await User.find({
    level: {
      $ne: UserLevel.UNKNOWN,
    },
  });
  // Create a new instance of a Workbook class
  var wb = new xl.Workbook();
  // Add Worksheets to the workbook
  var ws = wb.addWorksheet(
    `NIKA_STAKING_USER_INTEREST_${Math.floor(Date.now() / 1000)}`,
  );

  ws.cell(1, 1).string("Address");
  ws.cell(1, 2).string("Level");
  ws.cell(1, 3).string("Staking Interest Rate");
  ws.cell(1, 4).string("Global Interest Rate");
  ws.cell(1, 5).string("Global Reward");
  ws.cell(1, 6).string("Last Accumulated Timestamp");
  //   ws.cell(1, 6).string("Last updated");

  let row_number = 2;

  for (let user of users) {
    // Calculate ancestor current global rewards
    let {
      total_global_reward: updated_total_global_reward,
      // last_accrued_index: updated_last_accrued_index,
    } = calculate_total_global_rewards(
      user.accumulative_index,
      user.total_global_reward,
      user.global_interest_rate,
      user.last_accrued_timestamp,
      Math.floor(new Date().getTime() / 1000),
    );

    ws.cell(row_number, 1).string(user._id);
    ws.cell(row_number, 2).string(user.level);
    ws.cell(row_number, 3).string(
      `${new BigNumber(user.interest_rate)
        .div(10000)
        .multipliedBy(100)
        .toFixed()}%`,
    );
    ws.cell(row_number, 4).string(
      `${new BigNumber(user.global_interest_rate)
        .div(10000)
        .multipliedBy(100)
        .toFixed()}%`,
    );
    ws.cell(row_number, 5).string(
      new BigNumber(updated_total_global_reward).toString(),
    );
    ws.cell(row_number, 5).string(
      new BigNumber(updated_total_global_reward).toString(),
    );
    new Date(user.last_accrued_timestamp).getTime() > 0
      ? ws
          .cell(row_number, 6)
          .date(new Date(user.last_accrued_timestamp * 1000))
      : ws.number(row_number, 6).number(0);
    row_number++;
  }

  // await User.bulkWrite(
  //   Object.keys(updated_global_reward).map((user_address) => {
  //     const { total_global_reward, last_accrued_index } =
  //       updated_global_reward[user_address];
  //     return {
  //       updateOne: {
  //         filter: { _id: user_address },
  //         update: {
  //           total_global_reward,
  //           last_accrued_index,
  //         },
  //         upsert: true,
  //       },
  //     };
  //   }),
  // );

  // console.log(
  //   "wb: ",
  //   path.resolve("../../reports/Nika_Staking_User_Stats.xlsx"),
  //   process.cwd(),
  // );
  wb.write(
    `${process.cwd()}/src/reports/Nika_Staking_User_Stats.xlsx`,
    async function (err, stats) {
      if (err) {
        console.error(err);
      } else {
        console.log(stats); // Prints out an instance of a node.js fs.Stats object
        const auth = new GoogleAuth({
          keyFile: `${process.cwd()}/src/google-api-keys/nika-393107-93a6e2f75cf5.json`,
          scopes: "https://www.googleapis.com/auth/drive",
        });

        const service = google.drive({ version: "v3", auth });
        const requestBody = {
          name: "Nika_Staking_User_Stats.xlsx",
          fields: "id",
          parents: ["1VJp2Fvb8xlhKpYawXR3zE2LH4PwyWpyk"],
        };

        const media = {
          mimeType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          body: fs.createReadStream(
            `${process.cwd()}/src/reports/Nika_Staking_User_Stats.xlsx`,
          ),
        };

        try {
          const file = await service.files.create({
            requestBody,
            media: media,
          });

          res.status(200).send({
            created_status: "Successfully",
            file_id: file.data.id,
          });
        } catch (err) {
          // TODO(developer) - Handle error
          throw err;
        }
      }
    },
  );
});

export { routes as export_routes };
