import { Suspense } from "react";
import { requireUser } from "@/lib/dal";
import { getDollarData } from "@/lib/queries/dolar";
import { fetchDolarRates } from "@/lib/dolar";
import { DolarClient } from "./dolar-client";

async function DolarData() {
  const user = await requireUser();
  const [dollarData, dolarRates] = await Promise.all([
    getDollarData(user.id),
    fetchDolarRates().catch(() => null),
  ]);

  return <DolarClient initialData={dollarData} dolarRates={dolarRates} />;
}

export default function DolarPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <Suspense fallback={<div className="mono" style={{ padding: 40, fontSize: 11, color: "var(--faint)" }}>Cargando…</div>}>
        <DolarData />
      </Suspense>
    </div>
  );
}
