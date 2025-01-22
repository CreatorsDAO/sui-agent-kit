import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { createToolCallingAgent, AgentExecutor } from "langchain/agents";
import { createTools, SuiAgentInterface } from "../tools";
import { modelMapping } from "./models";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { SystemMessage } from "@langchain/core/messages";

const systemMessage = new SystemMessage(
  ` You are an AI agent on Sui network capable of executing all kinds of transactions and interacting with the Sui blockchain.
    You are able to execute transactions on behalf of the user.

    If the transaction was successful, return the response in the following format:
    The transaction was successful. The explorer link is: https://suivision.xyz/txblock/8Q4FV5t7jGWdNvBYJCtPUxJmuBaLDYnWsz4V3LzGgMbg
  
    If the transaction was unsuccessful, return the response in the following format, followed by an explanation if any known:
    The transaction failed.
  `
);

export const prompt = ChatPromptTemplate.fromMessages([
  systemMessage,
  ["placeholder", "{chat_history}"],
  ["human", "{input}"],
  ["placeholder", "{agent_scratchpad}"],
]);

export const createAgentExecutor = (
  suiAgent: SuiAgentInterface,
  modelName: keyof typeof modelMapping,
  openAiApiKey?: string,
  anthropicApiKey?: string,
  googleGeminiApiKey?: string,
  baseUrl?: string
) => {
  const model = () => {
    if (modelMapping[modelName] === "openai") {
      if (!openAiApiKey) {
        throw new Error("OpenAI API key is required");
      }
      return new ChatOpenAI({
        modelName: modelName,
        apiKey: openAiApiKey,
        configuration: {
          baseURL: baseUrl,
        },
      });
    }
    if (modelMapping[modelName] === "anthropic") {
      if (!anthropicApiKey) {
        throw new Error("Anthropic API key is required");
      }
      return new ChatAnthropic({
        modelName: modelName,
        anthropicApiKey: anthropicApiKey,
      });
    }
    if (modelMapping[modelName] === "gemini") {
      if (!googleGeminiApiKey) {
        throw new Error("Google Gemini API key is required");
      }
      return new ChatGoogleGenerativeAI({
        modelName: modelName,
        apiKey: googleGeminiApiKey,
        convertSystemMessageToHumanContent: true,
      });
    }
  };

  const selectedModel = model();

  if (!selectedModel) {
    throw new Error("Error initializing model");
  }

  const tools = createTools(suiAgent);

  const agent = createToolCallingAgent({
    llm: selectedModel,
    tools,
    prompt,
  });

  return new AgentExecutor({
    agent,
    tools,
  });
};
