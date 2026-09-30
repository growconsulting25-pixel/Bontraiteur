import { createElement, Fragment, type ReactNode } from "react";
import fr, { type Dictionary } from "./dictionaries/fr";
import en from "./dictionaries/en";
import type { Locale } from "./config";

export type { Dictionary };
export * from "./config";
export * from "./routes";

const dictionaries: Record<Locale, Dictionary> = { fr, en };

export const getDictionary = (locale: Locale): Dictionary => dictionaries[locale];

/** Remplace les `{variables}` d'un gabarit. */
export function format(template: string, vars: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? `{${key}}`));
}

/** Convertit `*texte*` en <em>texte</em> (accent serif des titres). */
export function rich(text: string): ReactNode {
  const parts = text.split(/\*([^*]+)\*/g);
  return createElement(
    Fragment,
    null,
    ...parts.map((part, i) => (i % 2 === 1 ? createElement("em", { key: i }, part) : part)),
  );
}
