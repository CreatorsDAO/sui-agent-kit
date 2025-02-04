// import { addLiquidity, type AddLiquidityParams } from "./mira/addLiquidity.js";
// import { swapExactInput, type SwapExactInputParams } from "./mira/swap.js";
// import { borrowAsset, type BorrowAssetParams } from "./swaylend/borrow.js";
// import {
//   supplyCollateral,
//   type SupplyCollateralParams,
// } from "./swaylend/supply.js";
// import {
//   transfer as walletTransfer,
//   type TransferParams,
// } from "./transfers/transfers.js";
import { createAgentExecutor } from "./executor";
import type { AgentExecutor } from "langchain/agents";

import { modelMapping } from "./models";
import {
  TransferParams,
  transfer as walletTransfer,
  GetBalanceParams,
  getBalance,
} from "../tools/basic";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Network } from "../tools/common";

export interface SuiAgentConfig {
  walletPrivateKey: string;
  model: keyof typeof modelMapping;
  openAiApiKey?: string;
  anthropicApiKey?: string;
  googleGeminiApiKey?: string;
  network: Network;
  baseUrl?: string;
}

export class SuiAgent {
  private walletPrivateKey: string;
  private agentExecutor: AgentExecutor;
  private model: keyof typeof modelMapping;
  private openAiApiKey?: string;
  private anthropicApiKey?: string;
  private googleGeminiApiKey?: string;
  private network: Network;
  private baseUrl?: string;
  private messages: string[] = [];

  constructor(config: SuiAgentConfig) {
    this.messages = [];
    this.walletPrivateKey = config.walletPrivateKey;
    this.model = config.model;
    this.openAiApiKey = config.openAiApiKey;
    this.anthropicApiKey = config.anthropicApiKey;
    this.googleGeminiApiKey = config.googleGeminiApiKey;
    this.network = config.network;
    this.baseUrl = config.baseUrl;
    if (!this.walletPrivateKey) {
      throw new Error("Sui wallet private key is required.");
    }

    this.agentExecutor = createAgentExecutor(
      this,
      this.model,
      this.openAiApiKey,
      this.anthropicApiKey,
      this.googleGeminiApiKey,
      this.baseUrl
    );
  }

  getCredentials() {
    return {
      walletPrivateKey: this.walletPrivateKey,
      openAiApiKey: this.openAiApiKey || "",
      anthropicApiKey: this.anthropicApiKey || "",
      googleGeminiApiKey: this.googleGeminiApiKey || "",
    };
  }

  getNetwork() {
    return this.network;
  }

  getAddress() {
    const pair = Ed25519Keypair.fromSecretKey(this.walletPrivateKey);
    return pair.getPublicKey().toSuiAddress();
  }

  async execute(input: string) {
    const maxMessages = 100;

    console.log("execute input : ", input);

    const response = await this.agentExecutor.invoke({
      input,
      chat_history: this.messages.join("\n"),
    });
    this.messages.push(`User: ${input}`);
    this.messages.push(`Assistant: ${response.output}`);

    if (this.messages.length > maxMessages) {
      this.messages = this.messages.slice(-maxMessages);
    }

    return response;
  }

  async transfer(params: TransferParams) {
    return await walletTransfer(params, this.walletPrivateKey, this.network);
  }

  // async swapExactInput(params: SwapExactInputParams) {
  //   return await swapExactInput(params, this.walletPrivateKey);
  // }

  // async supplyCollateral(params: SupplyCollateralParams) {
  //   return await supplyCollateral(params, this.walletPrivateKey);
  // }

  // async borrowAsset(params: BorrowAssetParams) {
  //   return await borrowAsset(params, this.walletPrivateKey);
  // }

  // async addLiquidity(params: AddLiquidityParams) {
  //   return await addLiquidity(params, this.walletPrivateKey);
  // }

  async getBalance(params: GetBalanceParams) {
    return await getBalance(params, this);
  }
}
