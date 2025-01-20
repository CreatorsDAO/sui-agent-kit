import { SuiAgent } from "../../src";

describe("hello", () => {
  it("should return hello", async () => {
    const agent = new SuiAgent({
      model: "deepseek-chat",
      openAiApiKey: "sk-2ce9470b6c4249a997ed66bd63b1639a",
      walletPrivateKey:
        "suiprivkey1qzuw2uvhqz330pwl94rv39jvk93kuvfd4pvdkw9vl922kum80prqvxtlntr",
      network: "testnet",
      baseUrl: "https://api.deepseek.com",
    });

    // // Call different functions
    const resp = await agent.transfer({
      to: "0x1",
      amount: "0.1",
      symbol: "SUI",
    });
    console.log(resp);

    // // or, execute commands in natural language
    const chatResp = await agent.execute("Send 0.1 SUI to 0x1");
    console.log(chatResp);
  });
});
