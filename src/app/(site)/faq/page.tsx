import { Plus } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { PageHero } from "@/components/sections/PageHero";
import { CTASection } from "@/components/sections/CTASection";
import { faq, faqGroups, type FaqItem } from "@/data/faq";
import { JsonLd, faqSchema, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Questions fréquentes",
  description:
    "Menu mensuel, modifications, livraisons urgentes, allergies, soumission : les réponses aux questions des CPE et garderies sur le service Bon Traiteur.",
  path: "/faq",
});

export default function FaqPage() {
  const groups = Object.entries(faqGroups) as Array<[FaqItem["group"], string]>;

  return (
    <>
      <PageHero
        eyebrow="FAQ"
        title={
          <>
            Vos questions. <em>Nos réponses, simplement.</em>
          </>
        }
        lead="Vous ne trouvez pas votre réponse? Appelez-nous ou écrivez-nous : une vraie personne vous répondra."
      />

      <Container size="narrow" className="pb-8">
        <div className="grid gap-14">
          {groups.map(([key, label]) => (
            <section key={key} aria-labelledby={`faq-${key}`}>
              <h2 id={`faq-${key}`} className="font-display text-h3 font-bold">
                {label}
              </h2>
              <div className="mt-5 border-t border-line">
                {faq
                  .filter((item) => item.group === key)
                  .map((item) => (
                    <details key={item.question} className="group border-b border-line">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-lg font-semibold [&::-webkit-details-marker]:hidden">
                        {item.question}
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-cream-deep transition-transform duration-300 group-open:rotate-45">
                          <Plus aria-hidden="true" className="size-4" />
                        </span>
                      </summary>
                      <p className="pr-12 pb-6 text-ink-soft">{item.answer}</p>
                    </details>
                  ))}
              </div>
            </section>
          ))}
        </div>
        <div className="mt-14 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/contact" arrow>
            Nous joindre
          </ButtonLink>
          <ButtonLink href="/soumission" variant="secondary">
            Demander une soumission
          </ButtonLink>
        </div>
      </Container>

      <CTASection />
      <JsonLd data={faqSchema(faq)} />
    </>
  );
}
