import "server-only";
import { db } from "@/lib/db";
import { userCache } from "@/lib/cache";

function mapTx(t: { id: string; name: string; category: string; amount: object; date: Date; note: string | null; blockId: string | null }) {
  return {
    id: t.id,
    name: t.name,
    category: t.category,
    amount: Number(t.amount),
    date: formatRelativeDate(t.date),
    time: t.date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
    note: t.note ?? undefined,
    blockId: t.blockId ?? undefined,
  };
}

export function getRecentTransactions(userId: string, limit = 8) {
  return userCache(
    async () => {
      const rows = await db.transaction.findMany({
        where: { userId }, orderBy: { date: "desc" }, take: limit,
      });
      return rows.map(mapTx);
    },
    userId,
    ["transactions-recent"],
  );
}

export function getAllTransactions(userId: string) {
  return userCache(
    async () => {
      const rows = await db.transaction.findMany({
        where: { userId }, orderBy: { date: "desc" },
      });
      return rows.map(mapTx);
    },
    userId,
    ["transactions-all"],
  );
}

function formatRelativeDate(date: Date): string {
  const now = new Date();
  const today     = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  if (d.getTime() === today.getTime())     return "Hoy";
  if (d.getTime() === yesterday.getTime()) return "Ayer";
  return date.toLocaleDateString("es-AR", { month: "short", day: "numeric" });
}
