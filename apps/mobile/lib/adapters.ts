import type { GlyphKind } from './data';
import type {
  Block as ApiBlock,
  Installment as ApiInstallment,
  Recurring as ApiRecurring,
  TxGroup,
  StatsResponse,
  Goal as ApiGoal,
} from './api';

// ── UI types (what screens/components expect) ────────────────────

export interface TransactionUI {
  id: string;
  label: string;
  meta: string;
  amount: number;
  glyph: GlyphKind;
  category: string;
  installment?: string;
  blockId?: string;
}

export interface BlockUI {
  id: string;
  label: string;
  spent: number;
  budget: number;
  glyph: GlyphKind;
  txs: number;
  note: string;
}

export interface InstallmentUI {
  id: string;
  label: string;
  category: string;
  monthly: number;
  paid: number;
  total: number;
  glyph: GlyphKind;
  nextDue: string;
  completedAt: string | null;
}

export interface RecurringUI {
  id: string;
  label: string;
  monthly: number;
  freq: string;
  nextDue: string;
  glyph: GlyphKind;
  category: string;
  paid: boolean;
}

export interface CategoryUI {
  label: string;
  value: number;
  glyph: GlyphKind;
  share: number;
}

export interface GoalUI {
  id: string;
  label: string;
  target: number;
  current: number;
  pct: number;
  deadline: string | null;
}

export interface TxGroupUI {
  date: string;
  isoDate: string;
  total: number;
  txs: TransactionUI[];
}

export interface StatsUI {
  balance: number;
  monthSpend: number;
  monthBudget: number;
  income: number;
  available: number;
  monthSeries: number[];
  netWorth12mo: number[];
  categories: CategoryUI[];
  todayBuckets: { label: string; amount: number }[];
  todaySpending: number;
  weekDaily: { day: string; amount: number }[];
  weekSpending: number;
  previousMonth?: { spending: number; income: number };
}

// ── Glyph mapping ────────────────────────────────────────────────

const CATEGORY_GLYPH_MAP: Record<string, GlyphKind> = {
  casa:           'Home',
  hogar:          'Home',
  alquiler:       'Home',
  vivienda:       'Home',
  comida:         'Coffee',
  alimentos:      'Coffee',
  supermercado:   'Coffee',
  restaurante:    'Coffee',
  transporte:     'Car',
  movilidad:      'Car',
  suscripciones:  'CreditCard',
  subscripcion:   'CreditCard',
  ocio:           'Music',
  entretenimiento:'Music',
  salud:          'Heart',
  medico:         'Heart',
  educacion:      'Book',
  aprendizaje:    'Book',
  tecnologia:     'DeviceLaptop',
  electronica:    'DeviceLaptop',
  ropa:           'ShoppingBag',
  indumentaria:   'ShoppingBag',
  viajes:         'Plane',
  viaje:          'Plane',
  servicios:      'Building',
  impuestos:      'Building',
  ahorro:         'TrendingUp',
  inversion:      'TrendingUp',
  ingresos:       'Coins',
  freelance:      'Briefcase',
  regalos:        'Heart',
  mascotas:       'Dog',
  otros:          'Globe',
};

export function deriveGlyph(category: string): GlyphKind {
  const key = category.toLowerCase().trim();
  return CATEGORY_GLYPH_MAP[key] ?? 'Globe';
}


// ── Adapters ─────────────────────────────────────────────────────

export function adaptBlock(b: ApiBlock): BlockUI {
  return {
    id:     b.id,
    label:  b.name,
    spent:  b.spent,
    budget: b.budget,
    glyph:  (b.icon as GlyphKind) ?? 'Home',
    txs:    b.txs,
    note:   b.goal ?? '',
  };
}

export function adaptInstallment(i: ApiInstallment): InstallmentUI {
  return {
    id:          i.id,
    label:       i.name,
    category:    i.category,
    monthly:     i.monthly,
    paid:        i.paid,
    total:       i.total,
    glyph:       deriveGlyph(i.category),
    nextDue:     i.nextDue,
    completedAt: i.completedAt ?? null,
  };
}

export function adaptRecurring(r: ApiRecurring): RecurringUI {
  const isBimestral = r.freq === 'bimestral';
  return {
    id:       r.id,
    label:    r.name,
    monthly:  isBimestral ? r.amount / 2 : r.amount,
    freq:     r.freq,
    nextDue:  r.nextDue,
    glyph:    deriveGlyph(r.category),
    category: r.category,
    paid:     r.paid,
  };
}

export function adaptTxGroup(g: TxGroup): TxGroupUI {
  return {
    date:  g.date,
    isoDate: g.isoDate,
    total: g.total,
    txs:   g.txs.map(t => ({
      id:          t.id,
      label:       t.name,
      meta:        `${t.category} · ${t.time}`,
      amount:      t.amount,
      glyph:       deriveGlyph(t.category),
      category:    t.category,
      installment: t.note?.includes('cuota') || t.note?.includes('Cuota') ? t.note : undefined,
      blockId:     t.blockId,
    })),
  };
}

export function adaptCategory(c: { name: string; amount: number; share: number }): CategoryUI {
  return {
    label: c.name,
    value: c.amount,
    glyph: deriveGlyph(c.name),
    share: c.share,
  };
}

export function adaptGoal(g: ApiGoal): GoalUI {
  return {
    id:       g.id,
    label:    g.name,
    target:   g.target,
    current:  g.current,
    pct:      g.target > 0 ? Math.min(1, g.current / g.target) : 0,
    deadline: g.deadline,
  };
}

export function adaptStats(s: StatsResponse): StatsUI {
  const netWorth12mo = s.netWorth24mo.slice(-12);
  return {
    balance:      s.balance,
    monthSpend:   s.monthly.spending,
    monthBudget:  s.monthly.budget,
    income:       s.monthly.income,
    available:    s.monthly.available,
    monthSeries:  s.dailySeries,
    netWorth12mo,
    categories:   s.categories.map(adaptCategory),
    todayBuckets: s.todayStats.buckets,
    todaySpending: s.todayStats.spending,
    weekDaily:     s.weekStats.daily,
    weekSpending:  s.weekStats.spending,
    previousMonth: s.previousMonth,
  };
}
