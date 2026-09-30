import { redirect } from "next/navigation";
import { PageTitle } from "@/components/portal/ui/PortalUI";
import { OrderForm } from "@/components/portal/OrderForm";
import { requireClient } from "@/lib/auth";
import { getMeals } from "@/lib/menu-repository";
import { mealName } from "@/lib/meal-name";
import { todayISO } from "@/lib/format";
import { getDictionary, type Locale } from "@/i18n";
import { portalHref } from "@/i18n/portal-routes";

export async function PortalNewOrderView({ locale }: { locale: Locale }) {
  const ctx = await requireClient(locale);
  if (!ctx.canAct) redirect(portalHref("orders", locale));
  const d = getDictionary(locale);
  const t = d.portal.orders;
  const meals = (await getMeals())
    .filter((m) => m.status === "disponible")
    .map((m) => ({ id: m.id, name: mealName(m, locale), group: d.menu.categories[m.category] }));

  return (
    <>
      <PageTitle title={t.formTitle} lead={t.formLead} />
      <OrderForm
        locale={locale}
        establishmentId={ctx.establishment.id}
        minDate={todayISO(1)}
        meals={meals}
        t={t}
        formats={d.portal.formats}
        successHref={`${portalHref("orders", locale)}?envoyee=1`}
      />
    </>
  );
}
