import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { SerialTransactionExecutor } from "@mysten/sui/transactions";

export const getSuiClient = (network: "devnet" | "testnet" | "mainnet") => {
  return new SuiClient({ url: getFullnodeUrl(network) });
};

export const getExecutor = async (
  privateKey: string,
  network: "devnet" | "testnet" | "mainnet"
) => {
  const client = getSuiClient(network);
  const pair = Ed25519Keypair.fromSecretKey(privateKey);
  const executor = new SerialTransactionExecutor({
    client,
    signer: pair,
  });

  const address = await pair.getPublicKey().toSuiAddress();
  console.log("address", address);
  return executor;
};

export const getTransactionLink = (
  network: "devnet" | "testnet" | "mainnet",
  digest: string
) => {
  return `https://${network}.suivision.xyz/txblock/${digest}`;
};
