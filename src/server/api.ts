import express from "express";
import { SuiAgent } from "../agent/suiAgent";
import { logError } from "./utils/errorHandler";
import dotenv from "dotenv";

dotenv.config();

const router: express.Router = express.Router();

// 初始化 SuiAgent
let agent: SuiAgent;
try {
  agent = new SuiAgent({
    model: process.env.MODEL as any,
    openAiApiKey: process.env.OPENAI_API_KEY || "",
    walletPrivateKey: process.env.WALLET_PRIVATE_KEY || "",
    network: "testnet",
    baseUrl: process.env.API_BASE_URL,
  });
} catch (error) {
  logError(error, "SuiAgent Initialization");
}

// 聊天接口
router.post("/chat", async (req: Request, res: Response) => {
  try {
    console.log("=== Chat Request ===");
    console.log("Headers:", req.headers);
    console.log("Body:", req.body);

    if (!agent) {
      throw new Error("SuiAgent not initialized");
    }

    const { message } = req.body;
    if (!message) {
      console.log("Missing message in request");
      return res.status(400).json({
        success: false,
        error: "Message is required",
      });
    }

    console.log("Processing chat request:", { message });
    const response = await agent.execute(message);
    console.log("Chat response received:", response);

    return res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    logError(error, "Chat Endpoint");
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
      details:
        process.env.NODE_ENV === "development"
          ? {
              stack: error instanceof Error ? error.stack : undefined,
              type: typeof error,
              errorObject: error,
            }
          : undefined,
    });
  }
});

// 获取余额接口
router.get("/balance", async (req, res) => {
  try {
    console.log("=== Balance Request ===");
    console.log("Headers:", req.headers);
    console.log("Query:", req.query);

    if (!agent) {
      throw new Error("SuiAgent not initialized");
    }

    const address = agent.getAddress();
    console.log("Getting balance for address:", address);

    const response = await agent.getBalance({
      walletAddress: address,
      assetSymbol: "SUI",
    });
    console.log("Balance response received:", response);

    return res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    logError(error, "Balance Endpoint");
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
      details:
        process.env.NODE_ENV === "development"
          ? {
              stack: error instanceof Error ? error.stack : undefined,
              type: typeof error,
              errorObject: error,
            }
          : undefined,
    });
  }
});

export default router;
