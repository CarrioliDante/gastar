import { Suspense } from "react";
import { requireUser } from "@/lib/dal";
import { getDashboardStats } from "@/lib/queries/stats";
import { getRecentTransactions } from "@/lib/queries/transactions";
import { getActiveInstallments } from "@/lib/queries/installments";
import { getBlocks } from "@/lib/queries/blocks";
import { getRecurringExpenses } from "@/lib/queries/recurring";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

async function DashboardData({ userId, userName }: { userId: string; userName: string }) {
  const [stats, transactions, installments, blocks, recurring] = await Promise.all([
    getDashboardStats(userId),
    getRecentTransactions(userId),
    getActiveInstallments(userId),
    getBlocks(userId),
    getRecurringExpenses(userId),
  ]);

  return (
    <DashboardShell
      userName={userName}
      initialStats={stats}
      initialTransactions={transactions}
      initialInstallments={installments}
      initialBlocks={blocks}
      initialRecurring={recurring}
    />
  );
}

function DashboardSkeleton() {
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 40px 80px" }}>
      <header style={{ paddingBottom: 28, borderBottom: "1px solid var(--hairline)" }}>
        <div style={{ height: 10, width: 120, background: "var(--hairline2)", borderRadius: 4, marginBottom: 14 }} />
        <div style={{ height: 28, width: 260, background: "var(--hairline2)", borderRadius: 6 }} />
      </header>
      <div style={{ paddingTop: 36 }}>
        <div style={{ height: 72, width: 320, background: "var(--hairline2)", borderRadius: 8, opacity: 0.6 }} />
      </div>
      <div style={{ marginTop: 28, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 32 }}>
        {[...Array(4)].map((_, i) => (
          <div key={i}>
            <div style={{ height: 32, width: "80%", background: "var(--hairline2)", borderRadius: 6, marginBottom: 10 }} />
            <div style={{ height: 9, width: "60%", background: "var(--hairline)", borderRadius: 3 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const user = await requireUser();
  const userName = user.user_metadata?.name ?? user.email?.split("@")[0] ?? "there";

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardData userId={user.id} userName={userName} />
    </Suspense>
  );
}
