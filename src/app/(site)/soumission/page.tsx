import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/sections/PageHero";
import { QuoteForm } from "@/components/forms/QuoteForm";
import { site } from "@/data/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Demander une soumission",
  description:
    "Obtenez une soumission pour les repas de votre CPE, garderie ou service de garde. Formule adaptée à votre nombre d'enfants, votre fréquence et vos besoins.",
  path: "/soumission",
});

const next = [
  { title: "On lit votre demande", text: "Et on vous appelle si on a besoin de précisions." },
  { title: "On vous propose une formule", text: "Adaptée à vos groupes, votre fréquence et vos formats." },
  { title: "On planifie le départ", text: "Premier menu, premières livraisons. Vous n'avez qu'à confirmer." },
];

export default function QuotePage() {
  return (
    <>
      <PageHero
        eyebrow="Soumission"
        title={
          <>
            Parlez-nous de <em>votre garderie.</em>
          </>
        }
        lead="Quelques questions pour vous proposer une formule adaptée à votre nombre d'enfants, votre fréquence et vos besoins. Environ 2 minutes."
      />
      <Container className="pb-section">
        <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr] lg:gap-14">
          <QuoteForm />
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <p className="eyebrow text-coral-ink">Et ensuite?</p>
            <ol className="mt-6 grid gap-6">
              {next.map((n, i) => (
                <li key={n.title} className="flex gap-4">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-saffron font-display text-sm font-bold">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-semibold">{n.title}</p>
                    <p className="text-ink-soft">{n.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-10 rounded-[var(--radius-lg)] bg-cream-deep p-6">
              <p className="font-semibold">Vous préférez en parler?</p>
              <a href={site.contact.phoneHref} className="mt-1 block font-display text-2xl font-bold hover:text-olive">
                {site.contact.phone}
              </a>
              <p className="mt-1 text-sm text-ink-soft">{site.contact.hours}</p>
            </div>
          </aside>
        </div>
      </Container>
    </>
  );
}
