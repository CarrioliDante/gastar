export const qk = {
  stats:         ["stats"] as const,
  transactions:  ["transactions"] as const,
  recentTx:      (limit: number) => ["transactions", "recent", limit] as const,
  installments:  ["installments"] as const,
  blocks:        ["blocks"] as const,
  recurring:     ["recurring"] as const,
  goals:         ["goals"] as const,
  categories:    ["categories"] as const,
  dollar:        ["dollar"] as const,
  dollarBalance: ["dollar", "balance"] as const,
};
