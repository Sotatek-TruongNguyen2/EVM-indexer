import mongoose, { Document } from "mongoose";
// import { ObjectId } from "mongodb";

export interface IUserDataTrie extends Document {
  _id: number;
  trie?: any;
}

export const UserDataTrieSchema = new mongoose.Schema({
  _id: {
    type: Number,
    required: true,
  },
  trie: {
    type: Object,
  },
});

export const UserDataTrie = mongoose.model("UserDataTrie", UserDataTrieSchema);
