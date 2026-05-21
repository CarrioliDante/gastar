export interface Transaction {
  id: string;
  name: string;
  category: string;
  amount: number;
  date: string;
  time: string;
  note?: string;
  blockId?: string;
}

export interface Installment {
  id: string;
  name: string;
  total: number;
  paid: number;
  remaining: number;
  total_installments: number;
  monthly: number;
  next_due: string;
}

export interface Block {
  id: string;
  name: string;
  icon: string;
  budget: number;
  spent: number;
  color: string;
  expenses: number;
  goal: string;
}

export interface Category {
  name: string;
  amount: number;
  percent: number;
}

export interface SpendingPoint {
  month: string;
  amount: number;
}

export interface BalanceData {
  total: number;
  currency: string;
  change: number;
}

export interface MonthlyStats {
  income: number;
  spending: number;
  savings: number;
  savingsGoal: number;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface TodayBucket {
  label: string;
  amount: number;
}

export interface WeekDay {
  day: string;
  amount: number;
}

export interface MonthDay {
  day: number;
  amount: number;
}

export interface TodayStats {
  spending: number;
  buckets: TodayBucket[];
}

export interface WeekStats {
  spending: number;
  daily: WeekDay[];
}
