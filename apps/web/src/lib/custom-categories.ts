import { db } from "@/lib/db";

export interface CustomCategory {
  id: string;
  label: string;
  glyph: string;
  type: "expense" | "income";
}

const DEFAULT_EXPENSE: CustomCategory[] = [
  { id: "comida", label: "Comida", glyph: "circle", type: "expense" },
  { id: "casa", label: "Casa", glyph: "square", type: "expense" },
  { id: "transporte", label: "Transporte", glyph: "line", type: "expense" },
  { id: "ocio", label: "Ocio", glyph: "arc", type: "expense" },
  { id: "subs", label: "Subscripciones", glyph: "ring", type: "expense" },
  { id: "salud", label: "Salud", glyph: "cross", type: "expense" },
];

const DEFAULT_INCOME: CustomCategory[] = [
  { id: "salario", label: "Salario", glyph: "dot", type: "income" },
  { id: "freelance", label: "Freelance", glyph: "dot", type: "income" },
  { id: "devolucion", label: "Devolución", glyph: "dot", type: "income" },
  { id: "inversion", label: "Inversión", glyph: "dot", type: "income" },
  { id: "regalo", label: "Regalo", glyph: "dot", type: "income" },
  { id: "otros", label: "Otros", glyph: "dot", type: "income" },
];

export function getDefaults(): CustomCategory[] {
  return [...DEFAULT_EXPENSE, ...DEFAULT_INCOME];
}

export async function getCustomCategories(
  userId: string,
): Promise<{ expenses: CustomCategory[]; incomes: CustomCategory[] }> {
  const setting = await db.userSetting.findUnique({
    where: { userId_key: { userId, key: "customCategories" } },
    select: { value: true },
  });
  if (setting?.value) {
    try {
      const all = JSON.parse(setting.value) as CustomCategory[];
      return {
        expenses: all.filter((c) => c.type === "expense"),
        incomes: all.filter((c) => c.type === "income"),
      };
    } catch {
      /* fall through */
    }
  }
  return { expenses: DEFAULT_EXPENSE, incomes: DEFAULT_INCOME };
}

export async function saveCustomCategories(
  userId: string,
  categories: CustomCategory[],
) {
  await db.userSetting.upsert({
    where: { userId_key: { userId, key: "customCategories" } },
    update: { value: JSON.stringify(categories) },
    create: { userId, key: "customCategories", value: JSON.stringify(categories) },
  });
}
