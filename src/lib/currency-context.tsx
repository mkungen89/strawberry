"use client";
import { createContext, useContext, useState } from "react";

type Currency = "USD" | "GBP" | "EUR";
const CurrencyContext = createContext<{
  currency: Currency;
  setCurrency: (c: Currency) => void;
  symbol: string;
  format: (usd: number, gbp: number, eur: number) => string;
}>({
  currency: "USD",
  setCurrency: () => {},
  symbol: "$",
  format: (usd) => `$${usd.toLocaleString()}`,
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<Currency>("USD");
  const symbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : "£";
  const format = (usd: number, gbp: number, eur: number) => {
    if (currency === "EUR") return `€${eur.toLocaleString()}`;
    if (currency === "GBP") return `£${gbp.toLocaleString()}`;
    return `$${usd.toLocaleString()}`;
  };
  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, symbol, format }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => useContext(CurrencyContext);
