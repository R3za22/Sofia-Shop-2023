import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Lang } from '../types';
import { en, type Key } from './en';
import { fa } from './fa';

const DICTS: Record<Lang, Record<Key, string>> = { en, fa };
const LANG_KEY = 'sofia.lang';

export interface I18n {
  lang: Lang;
  dir: 'ltr' | 'rtl';
  setLang(l: Lang): void;
  t(key: Key, vars?: Record<string, string | number>): string;
  num(n: number): string;
  /** Re-render the digits of an identifier (order number, card tail, phone) in the active script. */
  digits(s: string): string;
  money(n: number): string;
  date(ms: number): string;
}

function initialLang(): Lang {
  try {
    const q = new URLSearchParams(window.location.search).get('lang');
    if (q === 'fa' || q === 'en') return q;
    const saved = window.localStorage.getItem(LANG_KEY);
    if (saved === 'fa' || saved === 'en') return saved;
  } catch {
    /* storage blocked */
  }
  return 'en';
}

const Ctx = createContext<I18n | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);
  const dir = lang === 'fa' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem(LANG_KEY, l);
    } catch {
      /* storage blocked */
    }
  }, []);

  const value = useMemo<I18n>(() => {
    const locale = lang === 'fa' ? 'fa-IR' : 'en-US';
    const nf = new Intl.NumberFormat(locale);
    const df = new Intl.DateTimeFormat(lang === 'fa' ? 'fa-IR' : 'en-GB', { dateStyle: 'medium' });
    const dict = DICTS[lang];
    const t: I18n['t'] = (key, vars) =>
      dict[key].replace(/\{(\w+)\}/g, (_, k: string) => (vars && k in vars ? String(vars[k]) : `{${k}}`));
    const num = (n: number) => nf.format(n);
    const digits = (s: string) => (lang === 'fa' ? s.replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]) : s);
    return { lang, dir, setLang, t, num, digits, money: (n) => t('money', { n: num(n) }), date: (ms) => df.format(ms) };
  }, [lang, dir, setLang]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n(): I18n {
  const v = useContext(Ctx);
  if (!v) throw new Error('useI18n outside I18nProvider');
  return v;
}

export type { Key };
