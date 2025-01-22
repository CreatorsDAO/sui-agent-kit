import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { SerialTransactionExecutor } from "@mysten/sui/transactions";

export type Network = "devnet" | "testnet" | "mainnet";

export const getSuiClient = (network: Network) => {
  return new SuiClient({ url: getFullnodeUrl(network) });
};

export const getExecutor = async (privateKey: string, network: Network) => {
  const client = getSuiClient(network);
  const pair = Ed25519Keypair.fromSecretKey(privateKey);
  const executor = new SerialTransactionExecutor({
    client,
    signer: pair,
  });

  const address = pair.getPublicKey().toSuiAddress();
  console.log("address", address);
  return { executor, address };
};

export const getTransactionLink = (network: Network, digest: string) => {
  return `https://${network}.suivision.xyz/txblock/${digest}`;
};
