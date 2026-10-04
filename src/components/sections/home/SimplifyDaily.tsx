import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/ui/Reveal";
import { DashboardPreview } from "@/components/portal/DashboardPreview";
import { ButtonLink } from "@/components/ui/Button";
import { getDictionary, href, rich, type Locale } from "@/i18n";

/** Le différenciateur administratif : le futur portail client. */
export function SimplifyDaily({ locale, learnMore = false }: { locale: Locale; learnMore?: boolean }) {
  const t = getDictionary(locale).home.simplify;
  return (
    <Section tone="olive" labelledBy="simplify-title" className="overflow-hidden">
      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
          <div>
            <p className="eyebrow flex items-center gap-3 text-saffron">
              <span aria-hidden="true" className="inline-block h-px w-8 bg-current" />
              {t.eyebrow}
            </p>
            <h2 id="simplify-title" className="mt-5 text-h2 font-bold [&_em]:accent-serif [&_em]:text-saffron">
              {rich(t.title)}
            </h2>
            <p className="text-lead mt-6 text-cream/85">{t.lead}</p>

            <ul className="mt-10 grid gap-x-8 sm:grid-cols-2">
              {t.actions.map((action) => (
                <li key={action.label} className="border-t border-cream/15 py-4">
                  <p className="font-semibold">{action.label}</p>
                  <p className="text-sm text-cream/70">{action.detail}</p>
                </li>
              ))}
            </ul>

            {learnMore && (
              <ButtonLink href={href("howItWorks", locale)} variant="light" arrow className="mt-10">
                {t.learnMore}
              </ButtonLink>
            )}
          </div>

          <Reveal className="relative">
            <Badge tone="saffron" className="absolute -top-3 left-6 z-10">
              {t.badge}
            </Badge>
            <DashboardPreview locale={locale} className="lg:translate-x-6 xl:translate-x-10" />
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
