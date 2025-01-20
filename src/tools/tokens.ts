export interface TokenMetadata {
  symbol: string;
  decimals: number;
  tokenAddress: string;
}

export const tokens: Map<string, TokenMetadata> = new Map([
  ["SUI", { symbol: "SUI", decimals: 9, tokenAddress: "0x2::sui::SUI" }],
]);

export const getTokenMetadata = (symbol: string) => {
  return tokens.get(symbol.toUpperCase());
};

export const getAmount = (amount: string, meta: TokenMetadata) => {
  const v = parseFloat(amount);
  return BigInt(v * 10 ** meta.decimals);
};
