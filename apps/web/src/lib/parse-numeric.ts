/** Parse a numeric string that may use comma or dot as decimal separator.
 *  "4.500,50" → 4500.50 — "4,500.50" → 4500.50 */
export function parseNumeric(raw: unknown): number {
  if (!raw) return 0;
  const s = String(raw).trim();
  if (!s) return 0;
  // If it has both comma and dot, the last occurrence is the decimal separator
  const commaIdx = s.lastIndexOf(",");
  const dotIdx = s.lastIndexOf(".");
  if (commaIdx > dotIdx) {
    // Comma is decimal: "4.500,50" → remove dots, replace last comma with dot
    const withoutGroups = s.replace(/\./g, "");
    return parseFloat(withoutGroups.replace(",", ".")) || 0;
  }
  if (dotIdx > commaIdx) {
    // Dot is decimal: "4,500.50" → remove commas
    return parseFloat(s.replace(/,/g, "")) || 0;
  }
  return parseFloat(s) || 0;
}
