import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { Photo } from "@/components/ui/Photo";
import { Reveal } from "@/components/ui/Reveal";
import { site } from "@/data/site";

/** Appel à l'action final, réutilisé en bas de chaque page. */
export function CTASection({
  title = (
    <>
      Prêt à simplifier <em>vos repas?</em>
    </>
  ),
  text = "Parlez-nous de votre garderie. Nous vous proposerons une formule adaptée à votre nombre d'enfants, votre fréquence et vos besoins.",
}: {
  title?: React.ReactNode;
  text?: string;
}) {
  return (
    <section aria-labelledby="cta-final" className="py-section">
      <Container>
        <Reveal className="grid overflow-hidden rounded-[var(--radius-2xl)] bg-olive text-cream lg:grid-cols-[1.15fr_1fr]">
          <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-16">
            <h2 id="cta-final" className="text-h2 font-bold [&_em]:accent-serif [&_em]:text-saffron">
              {title}
            </h2>
            <p className="text-lead mt-6 max-w-xl text-cream/85">{text}</p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <ButtonLink href="/soumission" variant="accent" size="lg" arrow>
                Obtenir une soumission
              </ButtonLink>
              <a
                href={site.contact.phoneHref}
                className="inline-flex h-14 items-center justify-center rounded-full px-6 font-semibold text-cream ring-1 ring-cream/30 ring-inset transition-colors hover:bg-cream/10"
              >
                Ou appelez-nous : {site.contact.phone}
              </a>
            </div>
          </div>
          <Photo slot="ctaFinal" className="min-h-72 lg:min-h-full" sizes="(min-width: 1024px) 45vw, 100vw" />
        </Reveal>
      </Container>
    </section>
  );
}
