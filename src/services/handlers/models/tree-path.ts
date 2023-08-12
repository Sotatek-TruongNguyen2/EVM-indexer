import mongoose, { Document } from "mongoose";
import { ObjectId } from "mongodb";

export interface IUserTreePath extends Document {
  ancestor: string;
  descendant: string;
  path_length: number;
}

export const UserTreePathSchema = new mongoose.Schema({
  ancestor: {
    type: String,
    ref: "User",
    index: true,
  },
  descendant: {
    type: String,
    ref: "User",
    index: true,
  },
  path_length: {
    type: Number,
    require: true,
    default: 0,
  },
});

UserTreePathSchema.index({ ancestor: 1, descendant: 1 }, { unique: true });
export const UserTreePath = mongoose.model("UserTreePath", UserTreePathSchema);
