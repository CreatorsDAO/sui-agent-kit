import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { transfer } from "./basic";

type SuiAgentInterface = {
  getCredentials: () => { walletPrivateKey: string };
  getNetwork: () => "devnet" | "testnet" | "mainnet";
};

const withWalletKey = <T>(
  fn: (
    params: T,
    privateKey: string,
    network: "devnet" | "testnet" | "mainnet"
  ) => Promise<any>,
  agent: SuiAgentInterface
) => {
  return (params: T) =>
    fn(params, agent.getCredentials().walletPrivateKey, agent.getNetwork());
};

// Schema definitions
const transferSchema = z.object({
  to: z.string().describe("The wallet address to transfer to"),
  amount: z.string().describe("The amount to transfer"),
  symbol: z.string().describe("The asset symbol to transfer. eg. USDC, ETH"),
});

export const createTools = (agent: {
  getCredentials: () => { walletPrivateKey: string };
  getNetwork: () => "devnet" | "testnet" | "mainnet";
}) => {
  return [
    tool(withWalletKey(transfer, agent), {
      name: "sui_transfer",
      description: "Transfer any verified Sui asset to another wallet",
      schema: transferSchema,
    }),
  ];
};
