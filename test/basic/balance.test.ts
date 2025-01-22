import { SuiAgent } from "../../src";

describe("balance", () => {
  it("test get balance", async () => {
    const agent = new SuiAgent({
      model: "deepseek-chat",
      openAiApiKey: "sk-64e2e1d629e6441f84cfe9672822579b",
      walletPrivateKey:
        "suiprivkey1qzuw2uvhqz330pwl94rv39jvk93kuvfd4pvdkw9vl922kum80prqvxtlntr",
      network: "testnet",
      baseUrl: "https://api.deepseek.com",
    });

    // // Call different functions
    const resp = await agent.getBalance({
      walletAddress: agent.getAddress(),
      assetSymbol: "SUI",
    });
    console.log(resp);

    // // or, execute commands in natural language
    const chatResp = await agent.execute("What is my SUI Balance?");
    console.log(chatResp);
  });
});
