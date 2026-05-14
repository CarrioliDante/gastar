// Web-specific navigation type
export type View = "dashboard" | "transactions" | "blocks" | "insights" | "settings";

// Re-export all shared domain types
export type {
  Transaction,
  Installment,
  Block,
  Category,
  SpendingPoint,
  BalanceData,
  MonthlyStats,
  SavingsGoal,
  User,
} from "@gastar/shared";
