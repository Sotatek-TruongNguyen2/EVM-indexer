import { Log } from "@ethersproject/abstract-provider";

export type LogWithSender = Log & { sender: string };
