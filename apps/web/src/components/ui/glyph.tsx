// Re-exports BlockGlyph from primitives for backward compat
export { BlockGlyph as Glyph, toGlyphKind, type GlyphKind } from "@/components/ui/primitives";

// Map transaction category names → GlyphKind (Tabler icons)
export const CATEGORY_GLYPH: Record<string, import("@/components/ui/primitives").GlyphKind> = {
  // Comida
  Food:           "ToolsKitchen2",
  Comida:         "ToolsKitchen2",
  // Ingresos
  Income:         "Coins",
  Trabajo:        "Briefcase",
  Salario:        "Briefcase",
  Freelance:      "Briefcase",
  Devolución:     "Coins",
  Inversión:      "TrendingUp",
  Regalo:         "Heart",
  // Vivienda
  Housing:        "Home",
  Casa:           "Home",
  // Transporte
  Transport:      "Car",
  Transporte:     "Car",
  // Salud
  Health:         "Heart",
  Salud:          "Heart",
  // Ocio
  Leisure:        "Music",
  Ocio:           "Music",
  // Suscripciones
  Suscripciones:  "CreditCard",
  // Tecnología
  Technology:     "DeviceLaptop",
  Tecnología:     "DeviceLaptop",
  // Educación
  Education:      "Book",
  Educación:      "Book",
  // Ahorro
  Savings:        "TrendingUp",
  Ahorro:         "TrendingUp",
  // Viajes
  Viajes:         "Plane",
  // Compras
  Compras:        "ShoppingBag",
  // Otros
  Other:          "Globe",
  Otros:          "Globe",
};
