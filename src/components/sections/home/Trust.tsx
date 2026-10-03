import { Container } from "@/components/ui/Container";
import { Photo } from "@/components/ui/Photo";
import { Reveal } from "@/components/ui/Reveal";
import { getDictionary, rich, type Locale } from "@/i18n";

/** Équipe & confiance — bannière cuisine et engagements concrets. */
export function Trust({ locale }: { locale: Locale }) {
  const d = getDictionary(locale);
  const t = d.home.trust;
  return (
    <section aria-labelledby="trust-title" className="pb-section">
      {/* Bannière pleine largeur : l'équipe en cuisine */}
      <div className="relative isolate">
        <Photo slot="kitchenBanner" locale={locale} priority={false} showBrief={false} className="aspect-[4/3] w-full sm:aspect-[21/9] lg:aspect-[24/9]" sizes="100vw" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/40 to-transparent sm:bg-gradient-to-r sm:from-charcoal/85 sm:via-charcoal/45" />
        <Container className="absolute inset-x-0 bottom-0 pb-8 sm:top-0 sm:flex sm:items-center sm:pb-0">
          <Reveal className="max-w-xl text-cream">
            <p className="eyebrow flex items-center gap-3 text-saffron">
              <span aria-hidden="true" className="inline-block h-px w-8 bg-current" />
              {t.eyebrow}
            </p>
            <h2 id="trust-title" className="mt-4 text-h2 font-bold [&_em]:accent-serif [&_em]:text-saffron">
              {rich(t.title)}
            </h2>
          </Reveal>
        </Container>
      </div>

      <Container className="mt-16 sm:mt-20">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
          <div>
            <p className="text-lead text-ink-soft">{t.lead}</p>
          </div>
          <dl className="grid content-start gap-x-10 sm:grid-cols-2">
            {d.commitments.map((c, i) => (
              <Reveal key={c.title} delay={(i % 2) * 80} className="border-t border-line py-6">
                <dt className="font-display text-xl font-bold">{c.title}</dt>
                <dd className="mt-2 text-ink-soft">{c.text}</dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </Container>
    </section>
  );
}
