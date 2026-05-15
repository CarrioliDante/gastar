import { requireUser } from "@/lib/dal";
import { getAllTransactions } from "@/lib/queries/transactions";
import { getBlocks } from "@/lib/queries/blocks";
import { TransactionsClient } from "./transactions-client";

export default async function TransactionsPage() {
  const user = await requireUser();
  const [transactions, blocks] = await Promise.all([
    getAllTransactions(user.id),
    getBlocks(user.id),
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <TransactionsClient
        initialTransactions={transactions}
        initialBlocks={blocks}
      />
    </div>
  );
}
