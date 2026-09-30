export const locales = ["fr", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "fr";

export const htmlLang: Record<Locale, string> = { fr: "fr-CA", en: "en-CA" };
export const ogLocale: Record<Locale, string> = { fr: "fr_CA", en: "en_CA" };
