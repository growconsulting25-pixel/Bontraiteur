import type { Locale } from "@/i18n/config";

const TZ = "America/Toronto";
const tag = (locale: Locale) => (locale === "en" ? "en-CA" : "fr-CA");

/** Date « YYYY-MM-DD » (fuseau de Montréal). */
export function todayISO(offsetDays = 0) {
  const d = new Date(Date.now() + offsetDays * 86_400_000);
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}

/** Évite le décalage de fuseau pour les dates sans heure. */
const asDate = (value: string) => new Date(value.length === 10 ? `${value}T12:00:00` : value);

export function formatDate(value: string, locale: Locale, style: "long" | "short" | "weekday" = "long") {
  const options: Intl.DateTimeFormatOptions =
    style === "weekday"
      ? { weekday: "long", day: "numeric", month: "long" }
      : style === "short"
        ? { day: "numeric", month: "short" }
        : { day: "numeric", month: "long", year: "numeric" };
  const text = new Intl.DateTimeFormat(tag(locale), { ...options, timeZone: TZ }).format(asDate(value));
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function formatMonth(value: string, locale: Locale) {
  return new Intl.DateTimeFormat(tag(locale), { month: "long", year: "numeric", timeZone: TZ }).format(asDate(value));
}

export function monthName(value: string, locale: Locale) {
  return new Intl.DateTimeFormat(tag(locale), { month: "long", timeZone: TZ }).format(asDate(value));
}

export function formatMoney(cents: number, locale: Locale, currency = "CAD") {
  return new Intl.NumberFormat(tag(locale), { style: "currency", currency }).format(cents / 100);
}

/** Premier jour du mois (YYYY-MM-01) décalé de `offset` mois. */
export function monthStart(offset = 0, from = todayISO()) {
  const [y, m] = from.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + offset, 1));
  return d.toISOString().slice(0, 10);
}
