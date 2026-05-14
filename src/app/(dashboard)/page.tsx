"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { BalanceCard } from "@/components/dashboard/balance-card";
import { SpendingChart } from "@/components/dashboard/spending-chart";
import { SavingsCard } from "@/components/dashboard/savings-card";
import { CategoryBreakdown } from "@/components/dashboard/category-breakdown";
import { InstallmentsCard } from "@/components/dashboard/installments-card";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { BlocksMini } from "@/components/dashboard/blocks-mini";
import { QuickExpense } from "@/components/dashboard/quick-expense";

export default function DashboardPage() {
  const [quickOpen, setQuickOpen] = useState(false);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <div
        style={{
          padding: "36px 32px 48px",
          maxWidth: 960,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: 16 }}
        >
          <p style={{ color: "rgba(0,0,0,0.28)", fontSize: 11, letterSpacing: "0.08em" }}>
            {today}
          </p>
          <h1
            style={{
              color: "#111111",
              fontSize: 24,
              fontWeight: 400,
              letterSpacing: "-0.8px",
              marginTop: 5,
            }}
          >
            Good morning, Alex.
          </h1>
        </motion.div>

        {/* Row 1 */}
        <BalanceCard onQuickAdd={() => setQuickOpen(true)} />

        {/* Row 2 */}
        <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1fr", gap: 12 }}>
          <SpendingChart />
          <SavingsCard />
        </div>

        {/* Row 3 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 12 }}>
          <CategoryBreakdown />
          <InstallmentsCard />
        </div>

        {/* Row 4 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <RecentTransactions />
          <BlocksMini />
        </div>
      </div>

      <QuickExpense open={quickOpen} onClose={() => setQuickOpen(false)} />
    </>
  );
}
