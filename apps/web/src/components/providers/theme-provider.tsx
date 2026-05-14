"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme    = "light" | "dark";
type Font     = "sans" | "serif" | "mono";
type Currency = "USD" | "ARS" | "BRL" | "EUR";

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: "$", ARS: "$", BRL: "R$", EUR: "€",
};

interface ThemeCtx {
  theme:       Theme;
  font:        Font;
  currency:    Currency;
  currencySymbol: string;
  setTheme:    (t: Theme)    => void;
  setFont:     (f: Font)     => void;
  setCurrency: (c: Currency) => void;
  toggle:      () => void;
}

const Ctx = createContext<ThemeCtx>({
  theme: "light", font: "sans", currency: "USD", currencySymbol: "$",
  setTheme: () => {}, setFont: () => {}, setCurrency: () => {}, toggle: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme,    setThemeState]    = useState<Theme>("light");
  const [font,     setFontState]     = useState<Font>("sans");
  const [currency, setCurrencyState] = useState<Currency>("USD");

  useEffect(() => {
    const t = (localStorage.getItem("gastar-theme")    as Theme)    || "light";
    const f = (localStorage.getItem("gastar-font")     as Font)     || "sans";
    const c = (localStorage.getItem("gastar-currency") as Currency) || "USD";
    setThemeState(t);
    setFontState(f);
    setCurrencyState(c);
    document.documentElement.setAttribute("data-theme", t);
    document.documentElement.setAttribute("data-font",  f);
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem("gastar-theme", t);
    document.documentElement.setAttribute("data-theme", t);
  };

  const setFont = (f: Font) => {
    setFontState(f);
    localStorage.setItem("gastar-font", f);
    document.documentElement.setAttribute("data-font", f);
  };

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem("gastar-currency", c);
  };

  const toggle = () => setTheme(theme === "light" ? "dark" : "light");

  return (
    <Ctx.Provider value={{
      theme, font, currency,
      currencySymbol: CURRENCY_SYMBOLS[currency],
      setTheme, setFont, setCurrency, toggle,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export const useTheme = () => useContext(Ctx);
