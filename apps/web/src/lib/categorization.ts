type Rule = { category: string; patterns: RegExp[] };

const RULES: Rule[] = [
  {
    category: "Suscripciones",
    patterns: [
      /spotify/i, /netflix/i, /disney/i, /\bhbo\b/i,
      /amazon\s*(prime|music)/i, /youtube\s*premium/i,
      /apple\s*(tv|music|arcade|one)/i, /paramount/i, /deezer/i,
      /adobe/i, /canva/i, /figma/i, /notion/i,
      /chatgpt/i, /openai/i, /cursor\b/i,
      /vercel/i, /heroku/i, /cloudflare/i,
      /dropbox/i, /icloud/i, /github/i,
      /\bslack\b/i, /\bzoom\b/i, /microsoft\s*365/i, /office\s*365/i,
    ],
  },
  {
    category: "Comida",
    patterns: [
      /mcdonald/i, /burger\s*king/i, /\bwendy/i, /\bkfc\b/i,
      /\bsubway\b/i, /pizza/i, /sushi/i,
      /rest(o|aurant|aurante)/i, /caf[eé]/i, /bodeg[oó]n/i,
      /panader[íi]a/i, /almac[eé]n/i, /supermercado/i,
      /cencosud/i, /\bdisco\b/i, /carrefour/i, /walmart/i,
      /\bdia\b/i, /\bjumbo\b/i, /\bvea\b/i,
      /rappi/i, /pedidos\s*ya/i, /uber\s*eats/i, /ifood/i,
      /glovo/i, /dominos/i, /delivery/i,
    ],
  },
  {
    category: "Transporte",
    patterns: [
      /\buber\b/i, /cabify/i, /\btaxi\b/i,
      /subte/i, /\bsube\b/i, /\btren\b/i,
      /\bbus\b/i, /colectivo/i, /remis/i,
      /\bnafta\b/i, /peaje/i, /\bypf\b/i,
      /\bshell\b/i, /\baxion\b/i, /combustible/i, /gasolina/i,
      /parking/i, /estacionamiento/i,
    ],
  },
  {
    category: "Salud",
    patterns: [
      /farmac/i, /m[eé]dico/i, /doctor/i, /dentist/i,
      /cl[íi]nica/i, /hospital/i,
      /\bgym\b/i, /gimnasio/i, /\byoga\b/i, /pilates/i,
      /prepaga/i, /\bosde\b/i, /swiss\s*medical/i,
      /\bgaleno\b/i, /medif[eé]/i, /obra\s*social/i,
    ],
  },
  {
    category: "Casa",
    patterns: [
      /alquiler/i, /expensas/i, /\bluz\b/i, /\bgas\b/i,
      /\bagua\b/i, /electricidad/i,
      /fibertel/i, /arnet/i, /\bclaro\b/i,
      /movistar/i, /directv/i, /\bcable\b/i,
      /limpieza/i, /pintura/i, /plomero/i,
    ],
  },
  {
    category: "Tecnología",
    patterns: [
      /\bapple\b/i, /\bsamsung\b/i, /\blenovo\b/i,
      /\bdell\b/i, /\bhp\b/i, /xiaomi/i,
      /motorola/i, /huawei/i,
      /electr[oó]nica/i, /computadora/i, /notebook/i,
      /mercado\s*libre/i, /mercadolibre/i,
    ],
  },
  {
    category: "Educación",
    patterns: [
      /universidad/i, /facultad/i, /\bcolegio\b/i,
      /\bescuela\b/i, /\bcurso\b/i,
      /udemy/i, /coursera/i, /platzi/i, /domestika/i,
    ],
  },
  {
    category: "Ocio",
    patterns: [
      /\bcine\b/i, /teatro/i, /entradas/i, /\bshow\b/i,
      /concierto/i, /concert/i, /bowling/i, /karting/i,
      /\bhotel\b/i, /airbnb/i, /booking/i,
      /\bvuelo\b/i, /aerol[íi]nea/i, /\blatam\b/i,
    ],
  },
];

export function inferCategory(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return null;
  for (const rule of RULES) {
    if (rule.patterns.some(p => p.test(trimmed))) return rule.category;
  }
  return null;
}
