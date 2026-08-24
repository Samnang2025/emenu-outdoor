"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import en from "@/locales/en.json";
import kh from "@/locales/kh.json";

type LocaleKey = "en" | "kh";

type I18nContextValue = {
  locale: LocaleKey;
  setLocale: (l: LocaleKey) => void;
  t: (key: string) => string;
};

const defaultContext: I18nContextValue = {
  locale: "kh",
  setLocale: () => {},
  t: (k: string) => k,
};

const I18nContext = createContext<I18nContextValue>(defaultContext);

const LOCALES: Record<LocaleKey, Record<string, string>> = {
  en: en as Record<string, string>,
  kh: kh as Record<string, string>,
};

export function I18nProvider({
  children,
  defaultLocale = "kh",
}: {
  children: React.ReactNode;
  defaultLocale?: LocaleKey;
}) {
  const [locale, setLocale] = useState<LocaleKey>("kh");

  useEffect(() => {
    setLocale("kh");
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("locale", "kh");
    } catch (e) {
      // ignore
    }
  }, [locale]);

  const t = useMemo(() => {
    return (key: string) => {
      // simple flat key lookup; fall back to english or key
      const cur = LOCALES["kh"] || {};
      return cur[key] ?? LOCALES.en[key] ?? key;
    };
  }, [locale]);

  return (
    <I18nContext.Provider value={{ locale: "kh", setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useTranslation must be used within I18nProvider");
  return ctx;
}

export default I18nProvider;
