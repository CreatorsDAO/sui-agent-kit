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
// import { getOwnBalance, type GetOwnBalanceParams } from "./read/balance.js";

import { modelMapping } from "./models";
import { TransferParams, transfer as walletTransfer } from "../tools/basic";

export interface SuiAgentConfig {
  walletPrivateKey: string;
  model: keyof typeof modelMapping;
  openAiApiKey?: string;
  anthropicApiKey?: string;
  googleGeminiApiKey?: string;
  network: "devnet" | "testnet" | "mainnet";
  baseUrl?: string;
}

export class SuiAgent {
  private walletPrivateKey: string;
  private agentExecutor: AgentExecutor;
  private model: keyof typeof modelMapping;
  private openAiApiKey?: string;
  private anthropicApiKey?: string;
  private googleGeminiApiKey?: string;
  private network: "devnet" | "testnet" | "mainnet";
  private baseUrl?: string;
  constructor(config: SuiAgentConfig) {
    this.walletPrivateKey = config.walletPrivateKey;
    this.model = config.model;
    this.openAiApiKey = config.openAiApiKey;
    this.anthropicApiKey = config.anthropicApiKey;
    this.googleGeminiApiKey = config.googleGeminiApiKey;
    this.network = config.network;
    this.baseUrl = config.baseUrl;
    if (!this.walletPrivateKey) {
      throw new Error("Fuel wallet private key is required.");
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

  async execute(input: string) {
    const response = await this.agentExecutor.invoke({
      input,
    });
    return response;
  }

  // async swapExactInput(params: SwapExactInputParams) {
  //   return await swapExactInput(params, this.walletPrivateKey);
  // }

  async transfer(params: TransferParams) {
    return await walletTransfer(params, this.walletPrivateKey, this.network);
  }

  // async supplyCollateral(params: SupplyCollateralParams) {
  //   return await supplyCollateral(params, this.walletPrivateKey);
  // }

  // async borrowAsset(params: BorrowAssetParams) {
  //   return await borrowAsset(params, this.walletPrivateKey);
  // }

  // async addLiquidity(params: AddLiquidityParams) {
  //   return await addLiquidity(params, this.walletPrivateKey);
  // }

  // async getOwnBalance(params: GetOwnBalanceParams) {
  //   return await getOwnBalance(params, this.walletPrivateKey);
  // }
}
