"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useDollarData } from "@/hooks/queries";
import { useBuyDollars, useSellDollars } from "@/hooks/mutations";
import { useNumberInput } from "@/hooks/use-number-input";
import { springGentle } from "@/components/motion/presets";
import type { DolarRates } from "@/lib/dolar";
import type { DollarData } from "@/lib/queries/dolar";

const fieldStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: 8,
  background: "var(--surface)", border: "1px solid var(--hairline)",
  outline: "none", fontFamily: "inherit", fontSize: 13,
  color: "var(--ink)", letterSpacing: "-0.005em", boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  fontSize: 9, color: "var(--faint)", letterSpacing: "0.14em",
  textTransform: "uppercase", marginBottom: 6,
};

export function DolarClient({
  initialData,
  dolarRates,
}: {
  initialData: DollarData;
  dolarRates: DolarRates | null;
}) {
  const { data } = useDollarData(initialData);
  const dollarData = data ?? initialData;
  const buyMutation = useBuyDollars();
  const sellMutation = useSellDollars();

  const [mode, setMode] = useState<"BUY" | "SELL">("BUY");
  const [usdStr, setUsdStr] = useState("");
  const [rateStr, setRateStr] = useState("");
  const [note, setNote] = useState("");

  const isPending = buyMutation.isPending || sellMutation.isPending;

  const usd = useNumberInput({ value: usdStr, onChange: setUsdStr, currency: "USD", decimals: 2 });
  const rate = useNumberInput({ value: rateStr, onChange: setRateStr, currency: "ARS", decimals: 0 });

  const totalUsd = dollarData.totalUsd;
  const avgCost = dollarData.avgCost;
  const blueVenta = dolarRates?.blue.venta ?? 0;
  const oficialVenta = dolarRates?.oficial.venta ?? 0;

  const canSubmit = usd.numericValue > 0 && rate.numericValue > 0 && !isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const fd = new FormData();
    fd.set("usdAmount", String(usd.numericValue));
    fd.set("rate", String(rate.numericValue));
    if (note.trim()) fd.set("note", note.trim());

    const mutation = mode === "BUY" ? buyMutation : sellMutation;
    mutation.mutate(fd, {
      onSuccess: () => {
        setUsdStr("");
        setRateStr("");
        setNote("");
      },
    });
  };

  const setRate = (r: number) => setRateStr(String(r));

  return (
    <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 40px 80px" }}>

      {/* Header */}
      <header style={{ paddingBottom: 28, borderBottom: "1px solid var(--hairline)" }}>
        <motion.div
          className="mono"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springGentle, delay: 0.05 }}
          style={{ fontSize: 10, color: "var(--mute)", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 10 }}
        >
          Dólar
        </motion.div>
        <motion.h1
          className="display"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springGentle, delay: 0.1 }}
          style={{ margin: 0, fontSize: 28, fontWeight: 500, letterSpacing: "-0.035em", color: "var(--ink)", lineHeight: 1 }}
        >
          Tenencia
        </motion.h1>
      </header>

      {/* Summary cards */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springGentle, delay: 0.15 }}
        style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, padding: "28px 0", borderBottom: "1px solid var(--hairline)" }}
      >
        <div>
          <div className="display tnum" style={{ fontSize: 28, fontWeight: 500, letterSpacing: "-0.04em", color: "var(--ink)", lineHeight: 1 }}>
            USD {totalUsd.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mono" style={{ fontSize: 9, color: "var(--mute)", letterSpacing: "0.16em", textTransform: "uppercase", marginTop: 8 }}>
            Total USD
          </div>
        </div>
        <div>
          <div className="display tnum" style={{ fontSize: 28, fontWeight: 500, letterSpacing: "-0.04em", color: "var(--ink)", lineHeight: 1 }}>
            $ {avgCost.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mono" style={{ fontSize: 9, color: "var(--mute)", letterSpacing: "0.16em", textTransform: "uppercase", marginTop: 8 }}>
            Costo promedio
          </div>
        </div>
        <div>
          <div className="display tnum" style={{ fontSize: 28, fontWeight: 500, letterSpacing: "-0.04em", color: "var(--ink)", lineHeight: 1 }}>
            {blueVenta > 0 ? `$ ${blueVenta.toLocaleString("es-AR")}` : "—"}
          </div>
          <div className="mono" style={{ fontSize: 9, color: "var(--mute)", letterSpacing: "0.16em", textTransform: "uppercase", marginTop: 8 }}>
            Blue · Venta
          </div>
        </div>
        <div>
          <div className="display tnum" style={{ fontSize: 28, fontWeight: 500, letterSpacing: "-0.04em", color: "var(--ink)", lineHeight: 1 }}>
            {oficialVenta > 0 ? `$ ${oficialVenta.toLocaleString("es-AR")}` : "—"}
          </div>
          <div className="mono" style={{ fontSize: 9, color: "var(--mute)", letterSpacing: "0.16em", textTransform: "uppercase", marginTop: 8 }}>
            Oficial · Venta
          </div>
        </div>
      </motion.div>

      {/* Buy / Sell form */}
      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springGentle, delay: 0.2 }}
        onSubmit={handleSubmit}
        style={{ padding: "28px 0", borderBottom: "1px solid var(--hairline)" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
          <div className="mono" style={{ fontSize: 10, color: "var(--mute)", letterSpacing: "0.18em", textTransform: "uppercase" }}>
            Operación
          </div>
          <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", boxShadow: "inset 0 0 0 1px var(--hairline)" }}>
            {(["BUY", "SELL"] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setMode(t)}
                className="mono"
                style={{
                  padding: "7px 16px", border: "none", cursor: "pointer",
                  fontFamily: "inherit", fontSize: 11, letterSpacing: "0.06em",
                  background: mode === t ? "var(--ink)" : "var(--surface)",
                  color: mode === t ? "var(--inverse)" : "var(--mute)",
                  transition: "all 140ms ease",
                }}
              >
                {t === "BUY" ? "Comprar" : "Vender"}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr auto", gap: 12, alignItems: "flex-end" }}>
          <div>
            <div className="mono" style={labelStyle}>USD</div>
            <input
              ref={usd.ref}
              value={usd.display}
              onChange={usd.handleChange}
              onBlur={usd.handleBlur}
              placeholder="0"
              style={fieldStyle}
            />
          </div>
          <div>
            <div className="mono" style={labelStyle}>
              Cotización
              {dolarRates && (
                <span style={{ marginLeft: 6, display: "inline-flex", gap: 3 }}>
                  <button type="button" onClick={() => setRate(mode === "BUY" ? dolarRates.blue.venta : dolarRates.blue.compra)} style={{
                    padding: "2px 6px", borderRadius: 4,
                    background: "var(--surface)", border: "1px solid var(--hairline)",
                    cursor: "pointer", fontFamily: "inherit", fontSize: 8, color: "var(--mute)",
                  }}>
                    Blue
                  </button>
                  <button type="button" onClick={() => setRate(mode === "BUY" ? dolarRates.oficial.venta : dolarRates.oficial.compra)} style={{
                    padding: "2px 6px", borderRadius: 4,
                    background: "var(--surface)", border: "1px solid var(--hairline)",
                    cursor: "pointer", fontFamily: "inherit", fontSize: 8, color: "var(--faint)",
                  }}>
                    Oficial
                  </button>
                </span>
              )}
            </div>
            <input
              ref={rate.ref}
              value={rate.display}
              onChange={rate.handleChange}
              onBlur={rate.handleBlur}
              placeholder="0"
              style={fieldStyle}
            />
          </div>
          <div>
            <div className="mono" style={labelStyle}>ARS</div>
            <div style={{
              ...fieldStyle, background: "var(--bg)", color: "var(--mute)",
              display: "flex", alignItems: "center", height: 39, boxSizing: "border-box",
            }}>
              <span className="tnum" style={{ fontSize: 13, letterSpacing: "-0.01em" }}>
                {usd.numericValue > 0 && rate.numericValue > 0
                  ? `$ ${Math.round(usd.numericValue * rate.numericValue).toLocaleString("es-AR")}`
                  : "—"}
              </span>
            </div>
          </div>
          <motion.button
            type="submit"
            disabled={!canSubmit}
            whileTap={canSubmit ? { scale: 0.96 } : {}}
            style={{
              padding: "9px 20px", borderRadius: 8,
              background: canSubmit ? "var(--ink)" : "var(--surface)",
              color: canSubmit ? "var(--inverse)" : "var(--faint)",
              border: "none", fontFamily: "'Inter Tight', inherit",
              fontSize: 13, fontWeight: 500, letterSpacing: "-0.005em",
              cursor: canSubmit ? "pointer" : "default",
              boxShadow: canSubmit ? "none" : "inset 0 0 0 1px var(--hairline)",
              transition: "all 200ms ease",
              height: 39, boxSizing: "border-box",
            }}
          >
            {isPending ? "…" : mode === "BUY" ? "Comprar" : "Vender"}
          </motion.button>
        </div>

        <div style={{ marginTop: 10 }}>
          <div className="mono" style={{ ...labelStyle, opacity: 0.5 }}>Nota (opcional)</div>
          <input
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder={mode === "BUY" ? "Ej: Compra mensual" : "Ej: Venta parcial"}
            style={{ ...fieldStyle, maxWidth: 300 }}
          />
        </div>

        {(buyMutation.isError || sellMutation.isError) && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 12 }}>
            <div style={{ padding: "9px 12px", borderRadius: 8, background: "rgba(0,0,0,0.05)", fontSize: 12, color: "var(--ink)", fontFamily: "inherit" }}>
              {buyMutation.error?.message || sellMutation.error?.message || "Algo salió mal."}
            </div>
          </motion.div>
        )}
      </motion.form>

      {/* Operations history */}
      <div style={{ marginTop: 24 }}>
        <div className="mono" style={{ fontSize: 10, color: "var(--mute)", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 16 }}>
          Historial · {dollarData.operations.length} {dollarData.operations.length === 1 ? "operación" : "operaciones"}
        </div>

        {dollarData.operations.length === 0 ? (
          <div style={{ padding: "48px 0", textAlign: "center" }}>
            <div className="mono" style={{ fontSize: 11, color: "var(--faint)", letterSpacing: "0.06em" }}>
              Sin operaciones todavía.
            </div>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.04, delayChildren: 0.1 } } }}
          >
            {dollarData.operations.map(op => {
              const valueNow = blueVenta > 0 ? Math.round(op.usdAmount * blueVenta) : 0;
              return (
                <motion.div
                  key={op.id}
                  variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0, transition: springGentle } }}
                  style={{ padding: "14px 0", borderBottom: "1px solid var(--hairline)" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span className="mono" style={{
                        fontSize: 9, letterSpacing: "0.08em",
                        color: op.type === "BUY" ? "var(--ink)" : "var(--mute)",
                        padding: "3px 8px", borderRadius: 4,
                        background: "var(--surface)", border: "1px solid var(--hairline)",
                      }}>
                        {op.type === "BUY" ? "COMPRA" : "VENTA"}
                      </span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="tnum display" style={{ fontSize: 14, fontWeight: 500, letterSpacing: "-0.02em", color: "var(--ink)" }}>
                        USD {op.usdAmount.toFixed(2)}
                      </div>
                      <div className="mono" style={{ fontSize: 9, color: "var(--faint)", letterSpacing: "0.06em", marginTop: 2 }}>
                        {op.date}{op.note ? ` · ${op.note}` : ""}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div className="mono tnum" style={{ fontSize: 12, color: "var(--mute)", letterSpacing: "0.04em" }}>
                        $ {op.rate.toLocaleString("es-AR")} / USD
                      </div>
                      <div className="tnum display" style={{ fontSize: 13, fontWeight: 500, letterSpacing: "-0.02em", color: "var(--ink)", marginTop: 4 }}>
                        $ {op.arsAmount.toLocaleString("es-AR")}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

    </div>
    </div>
  );
}
