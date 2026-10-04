import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { Photo } from "@/components/ui/Photo";
import { Reveal } from "@/components/ui/Reveal";
import { primaryPhone } from "@/data/site";
import { getDictionary, href, rich, type Locale } from "@/i18n";

/** Appel à l'action final, réutilisé en bas de chaque page. */
export function CTASection({ locale, title, text }: { locale: Locale; title?: string; text?: string }) {
  const t = getDictionary(locale);
  return (
    <section aria-labelledby="cta-final" className="pt-4 pb-section sm:pt-6">
      <Container>
        <Reveal className="grid overflow-hidden rounded-[var(--radius-2xl)] bg-olive text-cream lg:grid-cols-[1.15fr_1fr]">
          <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-16">
            <h2 id="cta-final" className="text-h2 font-bold [&_em]:accent-serif [&_em]:text-saffron">
              {rich(title ?? t.cta.title)}
            </h2>
            <p className="text-lead mt-6 max-w-xl text-cream/85">{text ?? t.cta.text}</p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <ButtonLink href={href("quote", locale)} variant="accent" size="lg" arrow>
                {t.cta.button}
              </ButtonLink>
              <a
                href={primaryPhone.href}
                className="inline-flex h-14 items-center justify-center rounded-full px-6 font-semibold text-cream ring-1 ring-cream/30 ring-inset transition-colors hover:bg-cream/10"
              >
                {t.common.orCall} {primaryPhone.display}
              </a>
            </div>
          </div>
          <Photo slot="ctaFinal" locale={locale} className="min-h-72 lg:min-h-full" sizes="(min-width: 1024px) 45vw, 100vw" />
        </Reveal>
      </Container>
    </section>
  );
}
