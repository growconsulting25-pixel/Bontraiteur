import { getMeals } from "@/lib/menu-repository";
import { mealName } from "@/lib/meal-name";
import { getDictionary, href, type Locale } from "@/i18n";
import { portalHref } from "@/i18n/portal-routes";
import { ChatWidget } from "./ChatWidget";
import type { PortalGuideData, SiteGuideData } from "./guide-types";

/** Assistant guidé : prépare le contenu (FAQ, plats, liens) côté serveur, puis affiche le widget. */
export async function Assistant({ mode, locale, establishmentId }: { mode: "site" | "portal"; locale: Locale; establishmentId?: string }) {
  const d = getDictionary(locale);
  const meals = await getMeals();

  const siteData: SiteGuideData = {
    faq: d.faqPage.items.map((i) => ({ group: i.group, question: i.question, answer: i.answer })),
    groups: d.faqPage.groups,
    meals: meals.map((m) => ({
      name: mealName(m, locale),
      category: d.menu.categories[m.category],
      allergens: m.allergens.map((a) => d.menu.allergens[a]),
      occasional: m.rotationType === "ponctuelle",
    })),
    occasionalLabel: d.menu.rotations.ponctuelle,
    links: { menu: href("menu", locale), quote: href("quote", locale), how: href("howItWorks", locale), contact: href("contact", locale), login: href("login", locale) },
  };

  const p = d.portal;
  const portalData: PortalGuideData | undefined =
    mode === "portal"
      ? {
          links: {
            menu: portalHref("menu", locale),
            deliveries: portalHref("deliveries", locale),
            invoices: portalHref("invoices", locale),
            newOrder: portalHref("newOrder", locale),
            support: portalHref("support", locale),
          },
          slots: d.calendar.slots,
          menuStatus: p.menuStatus,
          orderKind: p.orders.kind,
          orderStatus: p.orders.status,
          deliveryStatus: p.deliveries.status,
          invoiceStatus: p.invoices.status,
        }
      : undefined;

  return <ChatWidget mode={mode} locale={locale} t={d.assistant} siteData={siteData} portalData={portalData} establishmentId={establishmentId} />;
}
