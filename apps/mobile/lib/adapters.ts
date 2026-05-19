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
  monthly: number;
  paid: number;
  total: number;
  glyph: GlyphKind;
  nextDue: string;
}

export interface RecurringUI {
  id: string;
  label: string;
  monthly: number;
  freq: string;
  nextDue: string;
  glyph: GlyphKind;
  category: string;
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
  pulso: number;
  pulsoMood: string;
  categories: CategoryUI[];
}

// ── Glyph mapping ────────────────────────────────────────────────

const CATEGORY_GLYPH_MAP: Record<string, GlyphKind> = {
  casa:           'square',
  hogar:          'square',
  alquiler:       'square',
  vivienda:       'square',
  comida:         'circle',
  alimentos:      'circle',
  supermercado:   'circle',
  restaurante:    'circle',
  transporte:     'line',
  movilidad:      'line',
  suscripciones:  'ring',
  subscripcion:   'ring',
  ocio:           'arc',
  entretenimiento:'arc',
  salud:          'cross',
  medico:         'cross',
  educacion:      'diamond',
  aprendizaje:    'diamond',
  tecnologia:     'diamond',
  electronica:    'diamond',
  ropa:           'half',
  indumentaria:   'half',
  viajes:         'arc',
  viaje:          'arc',
  servicios:      'line',
  impuestos:      'square',
  ahorro:         'dot',
  inversion:      'dot',
  ingresos:       'dot',
  freelance:      'dot',
  regalos:        'cross',
  mascotas:       'circle',
  otros:          'dot',
};

export function deriveGlyph(category: string): GlyphKind {
  const key = category.toLowerCase().trim();
  return CATEGORY_GLYPH_MAP[key] ?? 'dot';
}

export function derivePulsoMood(pulso: number): string {
  if (pulso >= 80) return 'Tranquilo';
  if (pulso >= 60) return 'Estable';
  if (pulso >= 40) return 'Atención';
  return 'Alerta';
}

// ── Adapters ─────────────────────────────────────────────────────

export function adaptBlock(b: ApiBlock): BlockUI {
  return {
    id:     b.id,
    label:  b.name,
    spent:  b.spent,
    budget: b.budget,
    glyph:  (b.icon as GlyphKind) ?? 'square',
    txs:    b.txs,
    note:   b.goal ?? '',
  };
}

export function adaptInstallment(i: ApiInstallment): InstallmentUI {
  return {
    id:      i.id,
    label:   i.name,
    monthly: i.monthly,
    paid:    i.paid,
    total:   i.total,
    glyph:   'square',
    nextDue: i.nextDue,
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
  };
}

export function adaptTxGroup(g: TxGroup): TxGroupUI {
  return {
    date:  g.date,
    total: g.total,
    txs:   g.txs.map(t => ({
      id:          t.id,
      label:       t.name,
      meta:        `${t.category} · ${t.time}`,
      amount:      t.amount,
      glyph:       deriveGlyph(t.category),
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
    pulso:        s.pulso,
    pulsoMood:    derivePulsoMood(s.pulso),
    categories:   s.categories.map(adaptCategory),
  };
}
