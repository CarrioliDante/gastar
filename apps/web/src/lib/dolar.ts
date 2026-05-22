import { unstable_cache } from "next/cache";

interface DolarApiResponse {
  moneda: string;
  casa: string;
  nombre: string;
  compra: number;
  venta: number;
  fechaActualizacion: string;
}

export interface DolarRate {
  compra: number;
  venta: number;
  fecha: string;
}

export interface DolarRates {
  blue: DolarRate;
  oficial: DolarRate;
}

async function _fetchDolarRates(): Promise<DolarRates> {
  const [blueRes, oficialRes] = await Promise.all([
    fetch("https://dolarapi.com/v1/dolares/blue"),
    fetch("https://dolarapi.com/v1/dolares/oficial"),
  ]);

  const parse = async (res: Response, label: string): Promise<DolarRate> => {
    if (!res.ok) throw new Error(`dolarapi.com ${label} error: ${res.status}`);
    const data: DolarApiResponse = await res.json();
    return { compra: data.compra, venta: data.venta, fecha: data.fechaActualizacion };
  };

  const [blue, oficial] = await Promise.all([parse(blueRes, "blue"), parse(oficialRes, "oficial")]);

  return { blue, oficial };
}

export const fetchDolarRates = unstable_cache(_fetchDolarRates, ["dolar-rates"], {
  revalidate: 3600,
  tags: ["dolar-rates"],
});
