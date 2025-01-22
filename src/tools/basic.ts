import { Transaction } from "@mysten/sui/transactions";
import { getExecutor, getSuiClient, getTransactionLink } from "./common";
import { getAmount, getTokenMetadata } from "./tokens";
import { z } from "zod";
import { Network } from "./common";
import { SuiAgentInterface } from ".";

export const emptySchema = z.object({});

// Schema definitions
export const transferSchema = z.object({
  to: z.string().describe("The wallet address to transfer to"),
  amount: z.string().describe("The amount to transfer"),
  symbol: z.string().describe("The asset symbol to transfer. eg. USDC, ETH"),
});

export type TransferParams = {
  to: string;
  amount: string;
  symbol: string;
};

export const transfer = async (
  params: TransferParams,
  privateKey: string,
  network: Network
) => {
  try {
    console.log("transfer params : ", params);
    const executor = await getExecutor(privateKey, network);
    const meta = getTokenMetadata(params.symbol);
    if (!meta) {
      throw new Error("Token not found");
    }

    const amount = getAmount(params.amount, meta);
    const tx = new Transaction();
    const [coin] = tx.splitCoins(tx.gas, [amount]);
    tx.transferObjects([coin], params.to);
    const result = await executor.executor.executeTransaction(tx);
    return JSON.stringify({
      status: "success",
      id: result.digest,
      link: getTransactionLink(network, result.digest),
    });
  } catch (error) {
    return JSON.stringify({
      status: "failure",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getBalanceSchema = z.object({
  walletAddress: z
    .string()
    .describe("The wallet address to get the balance of"),
  assetSymbol: z
    .string()
    .describe("The asset symbol to get the balance of. eg. USDC, ETH"),
});

export type GetBalanceParams = {
  walletAddress: string;
  assetSymbol: string;
};

export const getBalance = async (
  params: GetBalanceParams,
  agent: SuiAgentInterface
) => {
  try {
    if (params.walletAddress == "") {
      params.walletAddress = agent.getAddress();
    }

    const meta = getTokenMetadata(params.assetSymbol);
    if (!meta) {
      throw new Error("Token not found");
    }

    console.log("getBalance meta : ", meta);

    const rpc = getSuiClient(agent.getNetwork());
    const balance = await rpc.getBalance({
      owner: params.walletAddress,
      coinType: meta.tokenAddress,
    });

    console.log("getBalance balance : ", balance);

    return JSON.stringify({
      status: "success",
      balance: Number(balance.totalBalance) / 10 ** meta.decimals,
    });
  } catch (error) {
    return JSON.stringify({
      status: "failure",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
