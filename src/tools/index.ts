import { tool } from "@langchain/core/tools";
import { Network } from "./common";

import {
  getBalance,
  getBalanceSchema,
  transfer,
  transferSchema,
} from "./basic";

export type SuiAgentInterface = {
  getCredentials: () => { walletPrivateKey: string };
  getNetwork: () => Network;
  getAddress: () => string;
};

const withWalletKey = <T>(
  fn: (params: T, privateKey: string, network: Network) => Promise<any>,
  agent: SuiAgentInterface
) => {
  return (params: T) =>
    fn(params, agent.getCredentials().walletPrivateKey, agent.getNetwork());
};

const withoutWalletKey = <T>(
  fn: (params: T, network: SuiAgentInterface) => Promise<any>,
  agent: SuiAgentInterface
) => {
  return (params: T) => fn(params, agent);
};

export const createTools = (agent: {
  getCredentials: () => { walletPrivateKey: string };
  getNetwork: () => Network;
  getAddress: () => string;
}) => {
  return [
    tool(withWalletKey(transfer, agent), {
      name: "sui_transfer",
      description: "Transfer any verified Sui asset to another wallet",
      schema: transferSchema,
    }),
    tool(withoutWalletKey(getBalance, agent), {
      name: "get_balance",
      description:
        "Get the balance of an asset for a given wallet address. If checking your own balance, the '' walletAddress will be given.",
      schema: getBalanceSchema,
    }),
  ];
};
