import en from './en';
import tr from './tr';
import ja from './ja';
import { Locale } from '../config';

export const messages = { en, tr, ja } as const;

export type Messages = typeof en;

type Primitive = string | number | boolean | null | undefined;

function getNested(source: any, key: string): string | undefined {
  return key.split('.').reduce((current, part) => current?.[part], source);
}

export function translate(locale: Locale, key: string, params?: Record<string, Primitive>): string {
  const template = getNested(messages[locale], key) ?? getNested(messages.en, key) ?? key;
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, name) => String(params[name] ?? ''));
}
