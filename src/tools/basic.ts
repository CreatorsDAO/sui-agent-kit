import { Transaction } from "@mysten/sui/transactions";
import { getExecutor, getTransactionLink } from "./common";
import { getAmount, getTokenMetadata } from "./tokens";

export type TransferParams = {
  to: string;
  amount: string;
  symbol: string;
};

export const transfer = async (
  params: TransferParams,
  privateKey: string,
  network: "devnet" | "testnet" | "mainnet"
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
    const result = await executor.executeTransaction(tx);
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
