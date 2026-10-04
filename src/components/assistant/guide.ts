import type { Dictionary } from "@/i18n/dictionaries/fr";
import type { Locale } from "@/i18n/config";
import { findMeal, keywords, rank } from "@/lib/assistant/search";
import type { AssistantAction, Chip, Entry, PortalGuideData, SiteGuideData, Slot, Step } from "./guide-types";

/**
 * Moteur de l'assistant guidé (sans IA).
 * Chaque étape produit des messages, des boutons de choix et, dans le portail,
 * des actions à confirmer. Les données du compte viennent de /api/assistant/portal/data.
 */

type T = Dictionary["assistant"];
const fill = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k: string) => String(v[k] ?? ""));

export interface GuideContext {
  mode: "site" | "portal";
  locale: Locale;
  t: T;
  site: SiteGuideData;
  portal?: PortalGuideData;
  /** Identifie le compte/établissement (les données en cache ne passent pas d'un établissement à l'autre). */
  cacheKey?: string;
  /** Lecture des données du compte (portail). */
  fetchData?: <R>(kind: string, params?: Record<string, unknown>) => Promise<R>;
}

export type GuideResult = { entries: Entry[]; awaitHuman?: string | null };

const fmt = (locale: Locale, iso: string, opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat(locale === "en" ? "en-CA" : "fr-CA", { timeZone: "UTC", ...opts }).format(new Date(`${iso.slice(0, 10)}T12:00:00Z`));
const longDate = (l: Locale, iso: string) => fmt(l, iso, { weekday: "long", day: "numeric", month: "long" });
const shortDate = (l: Locale, iso: string) => fmt(l, iso, { weekday: "short", day: "numeric", month: "short" });
const monthLabel = (l: Locale, iso: string) => fmt(l, `${iso.slice(0, 7)}-01`, { month: "long", year: "numeric" });

const SITE_TOPICS = ["menu", "commandes", "livraison", "allergies", "facturation"] as const;

export function startChips(ctx: GuideContext): Chip[] {
  const { t } = ctx;
  if (ctx.mode === "portal") {
    const a = t.portalActions;
    return [
      { label: a.nextDelivery, step: { s: "p:next" } },
      { label: a.menu, step: { s: "p:menu" } },
      { label: a.changeMeal, step: { s: "p:change" } },
      { label: a.pause, step: { s: "p:pause" } },
      { label: a.cancelOrder, step: { s: "p:cancel" } },
      { label: a.newOrder, step: { s: "p:order" } },
      { label: a.invoices, step: { s: "p:invoices" } },
      { label: a.faq, step: { s: "p:faq" } },
      { label: a.human, step: { s: "p:human" } },
    ];
  }
  return [
    ...SITE_TOPICS.map((g) => ({ label: t.topics[g], step: { s: "topic", g } as Step })),
    { label: t.topics.client, step: { s: "client" } },
    { label: t.topics.human, step: { s: "human" } },
  ];
}

const backChip = (ctx: GuideContext): Chip => ({ label: ctx.t.backToStart, step: { s: "start" } });
const bot = (text: string, extra: Omit<Extract<Entry, { kind: "bot" }>, "kind" | "text"> = {}): Entry => ({ kind: "bot", text, ...extra });

function topicLinks(ctx: GuideContext, g: string) {
  const { t, site } = ctx;
  const L = site.links;
  const map: Record<string, Array<{ label: string; href: string }>> = {
    menu: [{ label: t.seeMenu, href: L.menu }, { label: t.howItWorks, href: L.how }],
    commandes: [{ label: t.howItWorks, href: L.how }, { label: t.getQuote, href: L.quote }],
    livraison: [{ label: t.getQuote, href: L.quote }, { label: t.contactPage, href: L.contact }],
    allergies: [{ label: t.seeMenu, href: L.menu }, { label: t.contactPage, href: L.contact }],
    facturation: [{ label: t.getQuote, href: L.quote }],
  };
  return ctx.mode === "site" ? (map[g] ?? []) : [];
}

function faqAnswer(ctx: GuideContext, i: number): Entry[] {
  const item = ctx.site.faq[i];
  if (!item) return [bot(ctx.t.dataError, { chips: [backChip(ctx)] })];
  const others = ctx.site.faq
    .map((f, j) => ({ f, j }))
    .filter(({ f, j }) => f.group === item.group && j !== i)
    .map(({ f, j }) => ({ label: f.question, step: { s: "faq", i: j } as Step }));
  return [
    bot(`**${item.question}**\n${item.answer}`, {
      links: topicLinks(ctx, item.group),
      chips: [...others, backChip(ctx)],
    }),
  ];
}

/* ------------------------------------------------------------------ */
/* Texte libre                                                          */
/* ------------------------------------------------------------------ */

const has = (words: string[], ...keys: string[]) => keys.some((k) => words.some((w) => w === k || w.startsWith(k)));

export async function answerText(ctx: GuideContext, text: string): Promise<GuideResult> {
  const w = keywords(text);
  const { t, site } = ctx;

  if (ctx.mode === "portal") {
    const route: Step | null = has(w, "parler", "personne", "equipe", "humain", "plainte", "probleme", "talk", "person", "team", "human", "complaint", "problem")
      ? { s: "p:human" }
      : has(w, "facture")
        ? { s: "p:invoices" }
        : has(w, "suspendre") && !has(w, "commande", "order")
          ? { s: "p:pause" }
          : has(w, "commande", "order") && has(w, "suspendre")
            ? { s: "p:cancel" }
            : has(w, "modifier", "plat")
              ? { s: "p:change" }
              : has(w, "confirmer", "confirm")
                ? { s: "p:menu" }
                : has(w, "commander", "ajouter", "supplementaire", "quantite", "extra", "add")
                  ? { s: "p:order" }
                  : has(w, "prochaine", "next") || (has(w, "livraison") && !has(w, "urgent", "region"))
                    ? { s: "p:next" }
                    : has(w, "menu")
                      ? { s: "p:menu" }
                      : null;
    if (route) return runStep(ctx, route);
  } else {
    if (has(w, "parler", "personne", "telephone", "appeler", "joindre", "contact", "humain", "talk", "person", "phone", "call", "human"))
      return runStep(ctx, { s: "human" });
    if (has(w, "portail", "connexion", "connecter", "compte", "client", "login", "portal", "account")) return runStep(ctx, { s: "client" });
  }

  // Un plat précis?
  const meal = findMeal(text, site.meals);
  if (meal) {
    const lines = [
      fill(t.mealFound, { meal: meal.name, category: meal.category, rotation: meal.occasional ? ` · ${site.occasionalLabel}` : "" }),
      meal.allergens.length ? fill(t.mealAllergens, { list: meal.allergens.join(", ") }) : t.mealNoAllergens,
      t.allergenNote,
    ];
    return {
      entries: [
        bot(lines.join("\n"), {
          links: ctx.mode === "site" ? [{ label: t.seeMenu, href: site.links.menu }] : [{ label: t.portalActions.changeMeal, href: ctx.portal!.links.menu }],
          chips: [backChip(ctx)],
        }),
      ],
    };
  }

  // FAQ
  const hits = rank(
    text,
    site.faq.map((f, i) => ({ title: f.question, text: `${f.answer} ${site.groups[f.group] ?? ""}`, value: i })),
  );
  if (hits.length && hits[0].score >= 0.9) {
    const [first, ...rest] = hits;
    const more = rest.filter((h) => h.score >= first.score * 0.6).slice(0, 2);
    const entries = faqAnswer(ctx, first.value);
    const last = entries[0] as Extract<Entry, { kind: "bot" }>;
    last.chips = [...more.map((h) => ({ label: site.faq[h.value].question, step: { s: "faq", i: h.value } as Step })), backChip(ctx)];
    return { entries };
  }

  return {
    entries: [bot(fill(t.notFound, { q: text.slice(0, 60) }), { chips: startChips(ctx), contacts: true })],
  };
}

/* ------------------------------------------------------------------ */
/* Étapes                                                               */
/* ------------------------------------------------------------------ */

interface MenuData {
  menu: { id: string; month: string; status: string; changeDeadline: string; canStillChange: boolean } | null;
  days?: Array<{ menuDayId: string; date: string; changedSlots: string[] } & Record<Slot, { id: string | null; name: string | null }>>;
}
interface Overview {
  today: string;
  canAct: boolean;
  canSeeInvoices: boolean;
  nextDeliveries: Array<{ id: string; date: string; window: string | null; status: string }>;
}

/** Données du compte gardées le temps d'un parcours (vidées après chaque action ou retour au début). */
let menuCache: MenuData | null = null;
let overviewCache: Overview | null = null;
let cacheOwner = "";
export function resetGuideCache() {
  menuCache = null;
  overviewCache = null;
}

const notAllowed = (ctx: GuideContext): GuideResult => ({
  entries: [bot(ctx.t.readOnly, { contacts: true, chips: [{ label: ctx.t.portalActions.human, step: { s: "p:human" } }, backChip(ctx)] })],
});

export async function runStep(ctx: GuideContext, step: Step): Promise<GuideResult> {
  const { t, locale, site } = ctx;
  const P = ctx.portal;
  const data = ctx.fetchData!;
  if (cacheOwner !== (ctx.cacheKey ?? "")) {
    cacheOwner = ctx.cacheKey ?? "";
    resetGuideCache();
  }

  switch (step.s) {
    case "start":
      resetGuideCache();
      return { entries: [bot(ctx.mode === "portal" ? t.portalGreeting : t.siteGreeting, { chips: startChips(ctx) })], awaitHuman: null };

    case "topic": {
      const items = site.faq.map((f, i) => ({ f, i })).filter(({ f }) => f.group === step.g);
      return {
        entries: [
          bot(t.topicIntro, {
            chips: [...items.map(({ f, i }) => ({ label: f.question, step: { s: "faq", i } as Step })), backChip(ctx)],
            links: topicLinks(ctx, step.g),
          }),
        ],
      };
    }

    case "faq":
      return { entries: faqAnswer(ctx, step.i) };

    case "client":
      return { entries: [bot(t.clientText, { links: [{ label: t.login, href: site.links.login }], chips: [backChip(ctx)] })] };

    case "human":
      return {
        entries: [bot(t.humanText, { contacts: true, links: [{ label: t.contactPage, href: site.links.contact }, { label: t.getQuote, href: site.links.quote }], chips: [backChip(ctx)] })],
      };

    /* ---------- Portail ---------- */
    case "p:faq":
      return {
        entries: [bot(t.otherTopics, { chips: [...SITE_TOPICS.map((g) => ({ label: t.topics[g], step: { s: "topic", g } as Step })), backChip(ctx)] })],
      };

    case "p:next": {
      const o = (overviewCache = await data<Overview>("overview"));
      const [first, ...rest] = o.nextDeliveries;
      if (!first) return { entries: [bot(t.noDelivery, { links: [{ label: t.seeDeliveries, href: P!.links.deliveries }], chips: startChips(ctx) })] };
      const lines = [
        fill(t.nextDelivery, { date: longDate(locale, first.date), window: first.window ? ` (${first.window})` : "", status: P!.deliveryStatus[first.status] ?? first.status }),
      ];
      if (rest.length) lines.push(fill(t.upcomingList, { list: rest.slice(0, 3).map((d) => shortDate(locale, d.date)).join(", ") }));
      return {
        entries: [
          bot(lines.join("\n"), {
            links: [{ label: t.seeDeliveries, href: P!.links.deliveries }],
            chips: [{ label: t.portalActions.pause, step: { s: "p:pause" } }, backChip(ctx)],
          }),
        ],
      };
    }

    case "p:menu": {
      const m = (menuCache = await data<MenuData>("menu"));
      if (!m.menu) return { entries: [bot(t.noMenu, { chips: startChips(ctx) })] };
      const month = monthLabel(locale, m.menu.month);
      const lines = [fill(t.menuStatusLine, { month, status: P!.menuStatus[m.menu.status] ?? m.menu.status })];
      lines.push(m.menu.canStillChange ? fill(t.menuDeadline, { date: longDate(locale, m.menu.changeDeadline) }) : fill(t.menuDeadlinePassed, { date: longDate(locale, m.menu.changeDeadline) }));
      const chips: Chip[] = [];
      if (m.menu.status === "publie" && m.menu.canStillChange) chips.push({ label: t.confirmMenuChip, step: { s: "p:confirmMenu", menuId: m.menu.id, month } });
      if (m.menu.canStillChange) chips.push({ label: t.portalActions.changeMeal, step: { s: "p:change" } });
      else chips.push({ label: t.portalActions.human, step: { s: "p:human" } });
      chips.push(backChip(ctx));
      return { entries: [bot(lines.join("\n"), { links: [{ label: t.openMenu, href: P!.links.menu }], chips })] };
    }

    case "p:confirmMenu": {
      const o = overviewCache ?? (overviewCache = await data<Overview>("overview"));
      if (!o.canAct) return notAllowed(ctx);
      return { entries: [action(fill(t.confirmMenuSummary, { month: step.month }), { type: "confirm_menu", menuId: step.menuId })] };
    }

    case "p:change": {
      const o = overviewCache ?? (overviewCache = await data<Overview>("overview"));
      if (!o.canAct) return notAllowed(ctx);
      const m = (menuCache = await data<MenuData>("menu"));
      if (!m.menu || !m.days?.length) return { entries: [bot(t.noMenu, { chips: startChips(ctx) })] };
      if (!m.menu.canStillChange)
        return {
          entries: [bot(fill(t.menuDeadlinePassed, { date: longDate(locale, m.menu.changeDeadline) }), { chips: [{ label: t.portalActions.human, step: { s: "p:human" } }, backChip(ctx)] })],
        };
      const weeks = [...new Set(m.days.map((d) => mondayOf(d.date)))];
      return {
        entries: [
          bot(`${t.pickWeek}\n${fill(t.calendarTip, { href: P!.links.menu })}`, {
            chips: [...weeks.map((w) => ({ label: fill(t.weekOf, { date: fmt(locale, w, { day: "numeric", month: "long" }) }), step: { s: "p:week", w } as Step })), backChip(ctx)],
          }),
        ],
      };
    }

    case "p:week": {
      const m = menuCache ?? (menuCache = await data<MenuData>("menu"));
      const days = (m.days ?? []).filter((d) => mondayOf(d.date) === step.w);
      return {
        entries: [
          bot(t.pickDay, {
            chips: [...days.map((d) => ({ label: `${shortDate(locale, d.date)} — ${d.repas.name ?? "—"}`, step: { s: "p:day", dayId: d.menuDayId } as Step })), { label: t.back, step: { s: "p:change" } }],
          }),
        ],
      };
    }

    case "p:day": {
      const m = menuCache ?? (menuCache = await data<MenuData>("menu"));
      const day = m.days?.find((d) => d.menuDayId === step.dayId);
      if (!day) return { entries: [bot(t.dataError, { chips: startChips(ctx) })] };
      const slots: Slot[] = ["repas", "dessert", "collation_am", "collation_pm"];
      return {
        entries: [
          bot(`**${longDate(locale, day.date)}**\n${t.pickSlot}`, {
            chips: [...slots.map((s) => ({ label: `${P!.slots[s]} : ${day[s].name ?? "—"}`, step: { s: "p:slot", dayId: day.menuDayId, slot: s } as Step })), { label: t.back, step: { s: "p:change" } }],
          }),
        ],
      };
    }

    case "p:slot": {
      const m = menuCache ?? (menuCache = await data<MenuData>("menu"));
      const day = m.days?.find((d) => d.menuDayId === step.dayId);
      const type = step.slot === "repas" ? "repas" : step.slot === "dessert" ? "dessert" : "collation";
      const meals = await data<Array<{ id: string; name: string; allergensDeclared: string[] }>>("meals", { type });
      const current = day?.[step.slot].id;
      const chips: Chip[] = meals
        .filter((x) => x.id !== current)
        .map((x) => ({ label: x.allergensDeclared.length ? `${x.name} (${x.allergensDeclared.join(", ")})` : x.name, step: { s: "p:meal", dayId: step.dayId, slot: step.slot, mealId: x.id, label: x.name } as Step }));
      if (day?.changedSlots.includes(step.slot)) chips.unshift({ label: t.restoreProposed, step: { s: "p:meal", dayId: step.dayId, slot: step.slot, mealId: null, label: "" } });
      chips.push({ label: t.back, step: { s: "p:change" } });
      return { entries: [bot(`${t.pickMeal}\n${t.allergenNote}`, { chips })] };
    }

    case "p:meal": {
      const m = menuCache ?? (menuCache = await data<MenuData>("menu"));
      const day = m.days?.find((d) => d.menuDayId === step.dayId);
      const dayLabel = day ? shortDate(locale, day.date) : "";
      const summary = step.mealId
        ? fill(t.changeSummary, { day: dayLabel, slot: P!.slots[step.slot], meal: step.label })
        : fill(t.restoreSummary, { day: dayLabel, slot: P!.slots[step.slot] });
      menuCache = null; // le menu change : relire la prochaine fois
      return { entries: [action(summary, { type: "set_menu_slot", menuDayId: step.dayId, slot: step.slot, mealId: step.mealId })] };
    }

    case "p:pause": {
      const o = overviewCache ?? (overviewCache = await data<Overview>("overview"));
      if (!o.canAct) return notAllowed(ctx);
      const d = await data<{ upcoming: Array<{ id: string; date: string; status: string }> }>("deliveries");
      const list = d.upcoming.filter((x) => x.status === "planifiee" && x.date > o.today).slice(0, 10);
      if (!list.length)
        return { entries: [bot(t.noPausable, { chips: [{ label: t.portalActions.human, step: { s: "p:human" } }, backChip(ctx)], contacts: true })] };
      return {
        entries: [
          bot(t.pickDelivery, {
            chips: [...list.map((x) => ({ label: longDate(locale, x.date), step: { s: "p:pauseOne", id: x.id, date: x.date } as Step })), backChip(ctx)],
          }),
        ],
      };
    }

    case "p:pauseOne":
      return { entries: [action(fill(t.pauseSummary, { date: longDate(locale, step.date) }), { type: "pause_delivery", deliveryId: step.id })] };

    case "p:cancel": {
      const o = overviewCache ?? (overviewCache = await data<Overview>("overview"));
      if (!o.canAct) return notAllowed(ctx);
      const orders = await data<Array<{ id: string; kind: string; status: string; deliveryDate: string }>>("orders");
      const list = orders.filter((x) => ["brouillon", "soumise"].includes(x.status) && x.deliveryDate > o.today).slice(0, 10);
      if (!list.length)
        return { entries: [bot(t.noCancellable, { chips: [{ label: t.portalActions.human, step: { s: "p:human" } }, backChip(ctx)], contacts: true })] };
      return {
        entries: [
          bot(t.pickOrder, {
            chips: [
              ...list.map((x) => ({
                label: fill(t.orderLabel, { kind: P!.orderKind[x.kind] ?? x.kind, date: longDate(locale, x.deliveryDate) }),
                step: { s: "p:cancelOne", id: x.id, date: x.deliveryDate } as Step,
              })),
              backChip(ctx),
            ],
          }),
        ],
      };
    }

    case "p:cancelOne":
      return { entries: [action(fill(t.cancelSummary, { date: longDate(locale, step.date) }), { type: "cancel_order", orderId: step.id })] };

    case "p:order":
      return { entries: [bot(t.newOrderText, { links: [{ label: t.newOrderLink, href: P!.links.newOrder }], chips: [backChip(ctx)] })] };

    case "p:invoices": {
      const inv = await data<Array<{ number: string; amount: string; status: string }> | { error: string }>("invoices");
      if (!Array.isArray(inv)) return { entries: [bot(t.noInvoiceAccess, { chips: startChips(ctx) })] };
      if (!inv.length) return { entries: [bot(t.noInvoices, { chips: startChips(ctx) })] };
      const lines = inv.slice(0, 4).map((i) => `- ${fill(t.invoiceLine, { number: i.number, amount: i.amount, status: P!.invoiceStatus[i.status] ?? i.status })}`);
      return { entries: [bot(lines.join("\n"), { links: [{ label: t.seeInvoices, href: P!.links.invoices }], chips: [backChip(ctx)] })] };
    }

    case "p:human":
      return {
        entries: [
          bot(t.humanPick, { chips: [...t.humanSubjects.map((subject) => ({ label: subject, step: { s: "p:humanSubject", subject } as Step })), backChip(ctx)] }),
        ],
      };

    case "p:humanSubject":
      return { entries: [bot(`${t.humanAsk}\n${t.humanUrgent}`, { contacts: true })], awaitHuman: step.subject };
  }
}

/** Le message écrit pour l'équipe devient une action « Envoyer » à confirmer. */
export function humanMessage(ctx: GuideContext, subject: string, message: string): Entry {
  return action(fill(ctx.t.humanSummary, { subject }), { type: "contact_team", subject, message });
}

function action(summary: string, a: AssistantAction): Entry {
  return { kind: "action", proposal: { id: `a${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, summary, action: a }, state: "pending" };
}

function mondayOf(iso: string) {
  const d = new Date(`${iso.slice(0, 10)}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
}
