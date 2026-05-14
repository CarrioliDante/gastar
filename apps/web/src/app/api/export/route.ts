import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const transactions = await db.transaction.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
  });

  const header = "Fecha,Nombre,Categoría,Monto,Nota\n";
  const rows = transactions.map(t => {
    const date  = t.date.toLocaleDateString("es-AR");
    const name  = `"${t.name.replace(/"/g, '""')}"`;
    const cat   = `"${t.category}"`;
    const amt   = Number(t.amount).toFixed(2);
    const note  = `"${(t.note ?? "").replace(/"/g, '""')}"`;
    return [date, name, cat, amt, note].join(",");
  }).join("\n");

  const csv = header + rows;
  const month = new Date().toLocaleDateString("es-AR", { month: "2-digit", year: "numeric" }).replace(/\//g, "-");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="gastar-${month}.csv"`,
    },
  });
}
