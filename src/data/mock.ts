import type {
  BalanceData,
  MonthlyStats,
  SpendingPoint,
  Category,
  Installment,
  Transaction,
  Block,
} from "@/types";

export const balanceData: BalanceData = {
  total: 24830.5,
  currency: "USD",
  change: 3.2,
};

export const monthlyStats: MonthlyStats = {
  income: 8500,
  spending: 4230,
  savings: 2800,
  savingsGoal: 5000,
};

export const spendingTrend: SpendingPoint[] = [
  { month: "Nov", amount: 3800 },
  { month: "Dec", amount: 5200 },
  { month: "Jan", amount: 4100 },
  { month: "Feb", amount: 3600 },
  { month: "Mar", amount: 4800 },
  { month: "Apr", amount: 4230 },
];

export const categories: Category[] = [
  { name: "Housing", amount: 1800, percent: 42 },
  { name: "Food", amount: 680, percent: 16 },
  { name: "Transport", amount: 420, percent: 10 },
  { name: "Health", amount: 350, percent: 8 },
  { name: "Leisure", amount: 580, percent: 14 },
  { name: "Other", amount: 400, percent: 10 },
];

export const installments: Installment[] = [
  {
    id: "1",
    name: "MacBook Pro",
    total: 2400,
    paid: 1600,
    remaining: 5,
    total_installments: 12,
    monthly: 200,
    next_due: "Jun 15",
  },
  {
    id: "2",
    name: "Camera Gear",
    total: 1800,
    paid: 600,
    remaining: 8,
    total_installments: 10,
    monthly: 180,
    next_due: "Jun 10",
  },
  {
    id: "3",
    name: "Sofa",
    total: 900,
    paid: 750,
    remaining: 2,
    total_installments: 6,
    monthly: 150,
    next_due: "Jun 20",
  },
];

export const transactions: Transaction[] = [
  { id: "1", name: "Grocery Store", category: "Food", amount: -82.3, date: "Today", time: "09:14" },
  { id: "2", name: "Salary Deposit", category: "Income", amount: 8500, date: "Today", time: "08:00" },
  { id: "3", name: "Netflix", category: "Leisure", amount: -15.99, date: "Yesterday", time: "00:00" },
  { id: "4", name: "Uber", category: "Transport", amount: -12.5, date: "Yesterday", time: "19:32" },
  { id: "5", name: "Gym Membership", category: "Health", amount: -65, date: "May 10", time: "07:00" },
  { id: "6", name: "Restaurant Sushi", category: "Food", amount: -47.8, date: "May 9", time: "20:15" },
  { id: "7", name: "Electricity Bill", category: "Housing", amount: -134.2, date: "May 8", time: "12:00" },
  { id: "8", name: "Freelance Project", category: "Income", amount: 1200, date: "May 7", time: "14:30" },
];

export const blocks: Block[] = [
  {
    id: "1",
    name: "Apartment",
    icon: "🏠",
    budget: 5000,
    spent: 3200,
    color: "#111111",
    expenses: 12,
    goal: "Cover all housing costs",
  },
  {
    id: "2",
    name: "Japan Trip",
    icon: "🗾",
    budget: 4000,
    spent: 1250,
    color: "#111111",
    expenses: 8,
    goal: "Save for 2026 summer trip",
  },
  {
    id: "3",
    name: "Freelance Setup",
    icon: "⚡",
    budget: 3000,
    spent: 2400,
    color: "#111111",
    expenses: 5,
    goal: "Equipment & tools",
  },
  {
    id: "4",
    name: "Gym Bulk",
    icon: "💪",
    budget: 800,
    spent: 350,
    color: "#111111",
    expenses: 6,
    goal: "Supplements & gym fees",
  },
  {
    id: "5",
    name: "Car",
    icon: "🚗",
    budget: 6000,
    spent: 4200,
    color: "#111111",
    expenses: 9,
    goal: "Insurance, fuel, maintenance",
  },
  {
    id: "6",
    name: "Moving",
    icon: "📦",
    budget: 2500,
    spent: 0,
    color: "#111111",
    expenses: 0,
    goal: "Planned relocation in August",
  },
];
