"use client";
import { createContext, useContext, useState } from "react";

type Currency = "USD" | "GBP";
const CurrencyContext = createContext<{
  currency: Currency;
  setCurrency: (c: Currency) => void;
  symbol: string;
  format: (usd: number, gbp: number) => string;
}>({
  currency: "USD",
  setCurrency: () => {},
  symbol: "$",
  format: (usd) => `$${usd.toLocaleString()}`,
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<Currency>("USD");
  const symbol = currency === "USD" ? "$" : "£";
  const format = (usd: number, gbp: number) =>
    currency === "USD"
      ? `$${usd.toLocaleString()}`
      : `£${gbp.toLocaleString()}`;
  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, symbol, format }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => useContext(CurrencyContext);
