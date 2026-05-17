export type GlyphKind =
  | 'circle' | 'dot' | 'square' | 'diamond'
  | 'arc' | 'line' | 'cross' | 'half'
  | 'ring' | 'triangle' | 'bar' | 'grid';

export interface Transaction {
  label: string;
  meta: string;
  amount: number;
  glyph: GlyphKind;
  installment?: string;
}

export interface Block {
  id: string;
  label: string;
  spent: number;
  budget: number;
  glyph: GlyphKind;
  txs: number;
  note: string;
}

export interface Installment {
  id: string;
  label: string;
  monthly: number;
  paid: number;
  total: number;
  glyph: GlyphKind;
  nextDue: string;
}

export interface Recurring {
  id: string;
  label: string;
  monthly: number;
  freq: string;
  nextDue: string;
  glyph: GlyphKind;
  category: string;
}

export interface Goal {
  id: string;
  label: string;
  saved: number;
  target: number;
  glyph: GlyphKind;
  eta: string;
}

export interface Category {
  label: string;
  value: number;
  glyph: GlyphKind;
  share: number;
}

export interface TxGroup {
  date: string;
  total: number;
  txs: Transaction[];
}

export const DATA = {
  balance: 1284640.5,
  monthSpend: 482300,
  monthSpendPrev: 521840,
  monthBudget: 600000,
  income: 1250000,
  monthSeries: [180,220,195,240,210,260,280,250,310,290,340,360,330,380,420,400,460,440,482],
  netWorth12mo: [820,845,870,902,945,980,1010,1058,1102,1158,1210,1284],
  pulso: 78,
  pulsoMood: 'Tranquilo',
  categories: [
    { label: 'Casa',          value: 184000, glyph: 'square'  as GlyphKind, share: 0.38 },
    { label: 'Comida',        value: 96400,  glyph: 'circle'  as GlyphKind, share: 0.20 },
    { label: 'Transporte',    value: 58200,  glyph: 'line'    as GlyphKind, share: 0.12 },
    { label: 'Suscripciones', value: 42100,  glyph: 'ring'    as GlyphKind, share: 0.09 },
    { label: 'Ocio',          value: 38600,  glyph: 'arc'     as GlyphKind, share: 0.08 },
    { label: 'Salud',         value: 21800,  glyph: 'cross'   as GlyphKind, share: 0.04 },
    { label: 'Otros',         value: 41200,  glyph: 'dot'     as GlyphKind, share: 0.09 },
  ] as Category[],
  installments: [
    { id: 'iphone',   label: 'iPhone 16 Pro',    monthly: 28500, paid: 4,  total: 12, glyph: 'square'  as GlyphKind, nextDue: 'Jun 05' },
    { id: 'japones',  label: 'Curso de japonés', monthly: 14200, paid: 7,  total: 10, glyph: 'arc'     as GlyphKind, nextDue: 'Jun 05' },
    { id: 'notebook', label: 'Notebook M4',      monthly: 38900, paid: 2,  total: 18, glyph: 'diamond' as GlyphKind, nextDue: 'Jun 10' },
    { id: 'bici',     label: 'Bicicleta',        monthly: 9800,  paid: 9,  total: 12, glyph: 'circle'  as GlyphKind, nextDue: 'Jun 12' },
  ] as Installment[],
  recurring: [
    { id: 'spotify', label: 'Spotify',      monthly: 2999,  freq: 'mensual',   nextDue: 'Jun 02', glyph: 'ring'   as GlyphKind, category: 'Suscripciones' },
    { id: 'netflix', label: 'Netflix',      monthly: 5499,  freq: 'mensual',   nextDue: 'Jun 08', glyph: 'ring'   as GlyphKind, category: 'Suscripciones' },
    { id: 'edenor',  label: 'Edenor',       monthly: 16800, freq: 'mensual',   nextDue: 'Jun 14', glyph: 'square' as GlyphKind, category: 'Casa' },
    { id: 'aguas',   label: 'AySA',         monthly: 8400,  freq: 'bimestral', nextDue: 'Jul 02', glyph: 'square' as GlyphKind, category: 'Casa' },
    { id: 'gym',     label: 'Gym SmartFit', monthly: 19500, freq: 'mensual',   nextDue: 'Jun 01', glyph: 'cross'  as GlyphKind, category: 'Salud' },
    { id: 'icloud',  label: 'iCloud+',      monthly: 1499,  freq: 'mensual',   nextDue: 'Jun 17', glyph: 'ring'   as GlyphKind, category: 'Suscripciones' },
  ] as Recurring[],
  blocks: [
    { id: 'apartment', label: 'Apartamento',     spent: 184000, budget: 240000,  glyph: 'square'  as GlyphKind, txs: 18, note: 'Alquiler · servicios · expensas' },
    { id: 'car',       label: 'Auto',            spent: 56400,  budget: 90000,   glyph: 'circle'  as GlyphKind, txs: 7,  note: 'Nafta · seguro · cocheras' },
    { id: 'japan',     label: 'Viaje Japón',     spent: 320000, budget: 1800000, glyph: 'arc'     as GlyphKind, txs: 4,  note: 'Aerolíneas · ryokan · JR Pass' },
    { id: 'freelance', label: 'Setup freelance', spent: 218000, budget: 280000,  glyph: 'diamond' as GlyphKind, txs: 11, note: 'Notebook · monitor · silla' },
    { id: 'gym',       label: 'Gym · bulk',      spent: 31200,  budget: 50000,   glyph: 'cross'   as GlyphKind, txs: 9,  note: 'Suplementos · comida · cuota' },
    { id: 'moving',    label: 'Mudanza',         spent: 0,      budget: 180000,  glyph: 'ring'    as GlyphKind, txs: 0,  note: 'Próximo mes · planeando' },
  ] as Block[],
  recent: [
    { label: 'Mercadolibre',    meta: 'Apartamento · 14:22',  amount: -8420,  glyph: 'square' as GlyphKind },
    { label: 'Café Lattente',   meta: 'Comida · 09:48',        amount: -3200,  glyph: 'circle' as GlyphKind },
    { label: 'Spotify',         meta: 'Suscripciones · ayer',  amount: -2999,  glyph: 'ring'   as GlyphKind, installment: 'recurrente' },
    { label: 'Uber',            meta: 'Transporte · ayer',     amount: -4600,  glyph: 'line'   as GlyphKind },
    { label: 'Cliente · Lemon', meta: 'Ingreso · 2 días',      amount: 420000, glyph: 'dot'    as GlyphKind },
    { label: 'iPhone 16 Pro',   meta: 'Cuota 4/12 · 2 días',   amount: -28500, glyph: 'square' as GlyphKind, installment: '4/12' },
    { label: 'Disco · A2',      meta: 'Comida · 3 días',       amount: -18420, glyph: 'circle' as GlyphKind },
    { label: 'Edenor',          meta: 'Apartamento · 4 días',  amount: -16800, glyph: 'square' as GlyphKind },
  ] as Transaction[],
  groups: [
    { date: 'Hoy · Jue 14', total: -16220, txs: [
      { label: 'Mercadolibre',     meta: 'Apartamento · 14:22', amount: -8420,  glyph: 'square' as GlyphKind },
      { label: 'Café Lattente',    meta: 'Comida · 09:48',       amount: -3200,  glyph: 'circle' as GlyphKind },
      { label: 'Subte',            meta: 'Transporte · 08:12',   amount: -1100,  glyph: 'line'   as GlyphKind },
      { label: 'Pan · La Alacena', meta: 'Comida · 08:05',       amount: -3500,  glyph: 'circle' as GlyphKind },
    ] as Transaction[] },
    { date: 'Ayer · Mié 13', total: -7599, txs: [
      { label: 'Spotify',          meta: 'Recurrente · 22:00',  amount: -2999,  glyph: 'ring'   as GlyphKind, installment: 'mensual' },
      { label: 'Uber',             meta: 'Transporte · 19:34',  amount: -4600,  glyph: 'line'   as GlyphKind },
    ] as Transaction[] },
    { date: 'Lun 12 · 2 días', total: 391500, txs: [
      { label: 'Cliente · Lemon',  meta: 'Ingreso · 14:00',     amount: 420000, glyph: 'dot'    as GlyphKind },
      { label: 'iPhone 16 Pro',    meta: 'Cuota 4/12 · 09:00',  amount: -28500, glyph: 'square' as GlyphKind, installment: '4/12' },
    ] as Transaction[] },
    { date: 'Dom 11 · 3 días', total: -22340, txs: [
      { label: 'Disco · A2',       meta: 'Comida · 16:20',      amount: -18420, glyph: 'circle' as GlyphKind },
      { label: 'Cine · IMAX',      meta: 'Ocio · 21:00',        amount: -3920,  glyph: 'arc'    as GlyphKind },
    ] as Transaction[] },
    { date: 'Sáb 10 · 4 días', total: -16800, txs: [
      { label: 'Edenor',           meta: 'Recurrente · 11:00',  amount: -16800, glyph: 'square' as GlyphKind, installment: 'mensual' },
    ] as Transaction[] },
  ] as TxGroup[],
};

export const MONTHS = ['Jun','Jul','Ago','Sep','Oct','Nov','Dic','Ene','Feb','Mar','Abr','May'];
