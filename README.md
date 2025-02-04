# sui-agent-kit

Connect any AI agents to SUI Network.


## Install

```bash
npm install sui-agent-kit
```

## New Agent Instance

```typescript
const agent = new SuiAgent({
  model: "deepseek-chat",
  openAiApiKey: "sk-",
  walletPrivateKey:
    "suiprivkey",
  network: "testnet",
  baseUrl: "https://api.deepseek.com",
});
```

## Transfer token

```typescript

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
```

## Get Balance

```typescript
const resp = await agent.getBalance({
  walletAddress: agent.getAddress(),
  assetSymbol: "SUI",
});
console.log(resp);

const chatResp = await agent.execute("What is my SUI Balance?");
console.log(chatResp);
```
