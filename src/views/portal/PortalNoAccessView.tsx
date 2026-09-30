import { EmptyState, PageTitle } from "@/components/portal/ui/PortalUI";
import { primaryPhone } from "@/data/site";
import { getDictionary, type Locale } from "@/i18n";

export function PortalNoAccessView({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).portal.noAccess;
  return (
    <>
      <PageTitle title={t.title} />
      <EmptyState>
        {t.text}{" "}
        <a href={primaryPhone.href} className="font-semibold text-charcoal underline">
          {primaryPhone.display}
        </a>
      </EmptyState>
    </>
  );
}
