"use client";

import { useState, useRef, useTransition, useCallback } from "react";
import Papa from "papaparse";
import { motion, AnimatePresence } from "motion/react";
import { importCsvTransactions, type CsvRow } from "@/app/actions/import-csv";
import type { CustomCategory } from "@/lib/custom-categories";

// ── Normalisation helpers ────────────────────────────────────────────────────

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

function parseAmount(raw: string): number {
  // Handle: "1.234,56" / "1,234.56" / "-1234.56" / "$ 1234"
  const s = raw.replace(/[^0-9.,-]/g, "").trim();
  // If both , and . present, the last separator is decimal
  const lastComma = s.lastIndexOf(",");
  const lastDot = s.lastIndexOf(".");
  let normalized: string;
  if (lastComma > lastDot) {
    normalized = s.replace(/\./g, "").replace(",", ".");
  } else {
    normalized = s.replace(/,/g, "");
  }
  return parseFloat(normalized);
}

function parseDate(raw: string): string | null {
  const s = raw.trim();
  // dd/mm/yyyy or dd-mm-yyyy
  const dmy = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (dmy) {
    const [, d, m, y] = dmy;
    const year = y.length === 2 ? `20${y}` : y;
    const date = new Date(`${year}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`);
    return isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
  }
  // yyyy-mm-dd
  const ymd = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (ymd) return s.slice(0, 10);
  return null;
}

// ── Bank format detection ────────────────────────────────────────────────────

type BankFormat = "mercadopago" | "bbva" | "galicia" | "generic";

interface ColumnMap {
  date: string;
  name: string;
  amount?: string;
  debit?: string;    // BBVA
  credit?: string;   // BBVA (to skip)
}

function detectFormat(headers: string[]): { format: BankFormat; cols: ColumnMap } | null {
  const h = headers.map(norm);

  const find = (...candidates: string[]) =>
    headers[h.findIndex((x) => candidates.some((c) => x === c || x.includes(c)))] ?? null;

  // Mercado Pago: tiene "descripcion" + "monto"
  if (h.some((x) => x.includes("monto")) && h.some((x) => x.includes("descripci"))) {
    const date = find("fecha", "date");
    const name = find("descripcion", "descripción", "description");
    const amount = find("monto", "importe");
    if (date && name && amount) return { format: "mercadopago", cols: { date, name, amount } };
  }

  // BBVA: "debito" + "credito"
  if (h.some((x) => x.includes("debito") || x.includes("débito")) && h.some((x) => x.includes("credito") || x.includes("crédito"))) {
    const date = find("fecha", "date");
    const name = find("concepto", "descripcion", "descripción");
    const debit = find("debito", "débito");
    const credit = find("credito", "crédito");
    if (date && name && debit) return { format: "bbva", cols: { date, name, debit, credit: credit ?? undefined } };
  }

  // Galicia: "importe"
  if (h.some((x) => x.includes("importe"))) {
    const date = find("fecha", "date");
    const name = find("descripcion", "descripción", "concepto");
    const amount = find("importe");
    if (date && name && amount) return { format: "galicia", cols: { date, name, amount } };
  }

  // Generic fallback: look for obvious patterns
  const date = find("fecha", "date", "dia", "día");
  const name = find("descripcion", "descripción", "concepto", "detalle", "nombre", "name", "description");
  const amount = find("monto", "importe", "amount", "valor", "total");
  if (date && name && amount) return { format: "generic", cols: { date, name, amount } };

  return null;
}

// ── Row extraction ───────────────────────────────────────────────────────────

interface PreviewRow extends CsvRow {
  id: number;
  selected: boolean;
  rawDate: string;
  valid: boolean;
}

function extractRows(
  data: Record<string, string>[],
  cols: ColumnMap,
  format: BankFormat,
  defaultCategory: string
): PreviewRow[] {
  return data
    .map((row, idx): PreviewRow | null => {
      const rawDate = row[cols.date] ?? "";
      const date = parseDate(rawDate);
      const name = (row[cols.name] ?? "").trim();

      let rawAmount = "";
      if (format === "bbva" && cols.debit) {
        rawAmount = row[cols.debit] ?? "";
        // Skip credit-only rows (income)
        const creditVal = cols.credit ? parseFloat((row[cols.credit] ?? "").replace(/[^0-9.-]/g, "")) : NaN;
        if (!rawAmount && !isNaN(creditVal) && creditVal > 0) return null;
      } else if (cols.amount) {
        rawAmount = row[cols.amount] ?? "";
      }

      const amount = Math.abs(parseAmount(rawAmount));

      if (!name || !date || isNaN(amount) || amount === 0) {
        return {
          id: idx,
          name: name || "Sin descripción",
          amount: 0,
          date: date ?? new Date().toISOString().slice(0, 10),
          category: defaultCategory,
          rawDate,
          selected: false,
          valid: false,
        };
      }

      return { id: idx, name, amount, date, category: defaultCategory, rawDate, selected: true, valid: true };
    })
    .filter((r): r is PreviewRow => r !== null);
}

// ── Component ────────────────────────────────────────────────────────────────

interface Props {
  categories: CustomCategory[];
}

export function CsvImporter({ categories }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<PreviewRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ imported: number; skipped: number } | null>(null);
  const [isPending, start] = useTransition();

  const expenseCategories = categories.filter((c) => c.type === "expense");
  const defaultCategory = expenseCategories[0]?.label ?? "Otros";

  const handleFile = useCallback((file: File) => {
    setError(null);
    setResult(null);
    setRows([]);

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: ({ data, meta }) => {
        const headers = meta.fields ?? [];
        const detected = detectFormat(headers);
        if (!detected) {
          setError("Formato no reconocido. Soportamos extractos de Mercado Pago, BBVA y Galicia.");
          return;
        }
        const parsed = extractRows(data, detected.cols, detected.format, defaultCategory);
        if (!parsed.length) {
          setError("No se encontraron transacciones en el archivo.");
          return;
        }
        setRows(parsed);
      },
      error: (err) => setError(err.message),
    });
  }, [defaultCategory]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const toggleRow = (id: number) =>
    setRows((prev) => prev.map((r) => r.id === id ? { ...r, selected: !r.selected } : r));

  const setCategoryForRow = (id: number, cat: string) =>
    setRows((prev) => prev.map((r) => r.id === id ? { ...r, category: cat } : r));

  const handleSubmit = () => {
    const toImport: CsvRow[] = rows
      .filter((r) => r.selected && r.valid)
      .map(({ name, amount, date, category }) => ({ name, amount, date, category }));

    if (!toImport.length) return;

    start(async () => {
      try {
        const res = await importCsvTransactions(toImport);
        setResult(res);
        setRows([]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al importar");
      }
    });
  };

  const selectedCount = rows.filter((r) => r.selected && r.valid).length;

  if (result) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ paddingTop: 16 }}
      >
        <p style={{ fontSize: 13, color: "var(--ink)", margin: "0 0 4px" }}>
          {result.imported} transacciones importadas
          {result.skipped > 0 && `, ${result.skipped} omitidas (duplicadas)`}
        </p>
        <button
          onClick={() => setResult(null)}
          style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: 12, color: "var(--faint)" }}
        >
          Importar otro archivo
        </button>
      </motion.div>
    );
  }

  if (!rows.length) {
    return (
      <div style={{ paddingTop: 16 }}>
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileRef.current?.click()}
          style={{
            border: "1px dashed var(--hairline2)",
            borderRadius: 10,
            padding: "20px",
            cursor: "pointer",
            textAlign: "center",
            transition: "border-color 200ms",
          }}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            style={{ display: "none" }}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
          <p style={{ margin: "0 0 4px", fontSize: 13, color: "var(--mute)" }}>
            Arrastrá o hacé click para subir un CSV
          </p>
          <p className="mono" style={{ margin: 0, fontSize: 9, color: "var(--faint)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Mercado Pago · BBVA · Galicia
          </p>
        </div>
        {error && (
          <p style={{ marginTop: 10, fontSize: 12, color: "var(--ink)", background: "rgba(0,0,0,0.05)", borderRadius: 6, padding: "8px 12px" }}>
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div style={{ paddingTop: 16 }}>
      <div style={{ marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 12, color: "var(--mute)" }}>
          {rows.filter((r) => r.valid).length} transacciones · {selectedCount} seleccionadas
        </span>
        <button
          onClick={() => setRows([])}
          style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: 12, color: "var(--faint)" }}
        >
          Cancelar
        </button>
      </div>

      {/* Preview table */}
      <div style={{
        maxHeight: 320,
        overflowY: "auto",
        border: "1px solid var(--hairline)",
        borderRadius: 8,
        marginBottom: 14,
      }}>
        {rows.filter((r) => r.valid).map((row) => (
          <div
            key={row.id}
            style={{
              display: "grid",
              gridTemplateColumns: "20px 1fr 90px 80px",
              gap: 10,
              padding: "8px 12px",
              alignItems: "center",
              borderBottom: "1px solid var(--hairline)",
              opacity: row.selected ? 1 : 0.4,
            }}
          >
            <input
              type="checkbox"
              checked={row.selected}
              onChange={() => toggleRow(row.id)}
              style={{ cursor: "pointer", accentColor: "var(--ink)" }}
            />
            <div>
              <p style={{ margin: 0, fontSize: 12, color: "var(--ink)", letterSpacing: "-0.005em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {row.name}
              </p>
              <p className="mono" style={{ margin: 0, fontSize: 9, color: "var(--faint)", letterSpacing: "0.05em" }}>
                {row.date}
              </p>
            </div>
            <select
              value={row.category}
              onChange={(e) => setCategoryForRow(row.id, e.target.value)}
              style={{
                background: "var(--surface)", border: "1px solid var(--hairline)",
                borderRadius: 6, padding: "3px 6px", fontSize: 11,
                color: "var(--mute)", fontFamily: "inherit", cursor: "pointer",
              }}
            >
              {expenseCategories.map((c) => (
                <option key={c.id} value={c.label}>{c.label}</option>
              ))}
            </select>
            <span style={{ fontSize: 12, color: "var(--ink)", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
              ${row.amount.toLocaleString("es-AR")}
            </span>
          </div>
        ))}
      </div>

      {error && (
        <p style={{ marginBottom: 10, fontSize: 12, color: "var(--ink)", background: "rgba(0,0,0,0.05)", borderRadius: 6, padding: "8px 12px" }}>
          {error}
        </p>
      )}

      <motion.button
        onClick={handleSubmit}
        disabled={isPending || selectedCount === 0}
        whileTap={!isPending ? { scale: 0.97 } : {}}
        style={{
          background: "var(--ink)", color: "var(--inverse)", border: "none",
          borderRadius: 8, padding: "9px 18px", fontSize: 13,
          fontWeight: 500, letterSpacing: "-0.01em", fontFamily: "inherit",
          cursor: isPending || selectedCount === 0 ? "default" : "pointer",
          opacity: isPending || selectedCount === 0 ? 0.5 : 1,
        }}
      >
        {isPending ? "Importando…" : `Importar ${selectedCount} transacciones`}
      </motion.button>
    </div>
  );
}
