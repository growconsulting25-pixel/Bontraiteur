import { Phone, Mail, Clock, MapPin } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { PageHero } from "@/components/sections/PageHero";
import { site } from "@/data/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Nous joindre",
  description: "Communiquez avec l'équipe Bon Traiteur pour toute question sur nos repas et nos livraisons pour CPE et garderies.",
  path: "/contact",
});

const channels = [
  { icon: Phone, label: "Téléphone", value: site.contact.phone, href: site.contact.phoneHref },
  { icon: Mail, label: "Courriel", value: site.contact.email, href: `mailto:${site.contact.email}` },
  { icon: Clock, label: "Heures", value: site.contact.hours },
  { icon: MapPin, label: "Zone desservie", value: site.contact.serviceArea },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title={
          <>
            Une question? <em>Parlons-en.</em>
          </>
        }
        lead="Une vraie personne vous répond. Pour une nouvelle garderie, la demande de soumission est le chemin le plus rapide."
      />
      <Container className="pb-section">
        <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <ul className="grid gap-4 sm:grid-cols-2">
            {channels.map(({ icon: Icon, label, value, href }) => (
              <li key={label} className="rounded-[var(--radius-xl)] bg-paper p-7 ring-1 ring-line">
                <Icon aria-hidden="true" className="size-6 text-coral-ink" />
                <p className="eyebrow mt-6 text-ink-soft">{label}</p>
                {href ? (
                  <a href={href} className="mt-2 block font-display text-xl font-bold break-words hover:text-olive">
                    {value}
                  </a>
                ) : (
                  <p className="mt-2 font-display text-xl font-bold">{value}</p>
                )}
              </li>
            ))}
          </ul>
          <div className="flex flex-col justify-between rounded-[var(--radius-xl)] bg-olive p-8 text-cream sm:p-10">
            <div>
              <p className="font-display text-h3 font-bold">Vous êtes une nouvelle garderie?</p>
              <p className="mt-3 text-cream/85">
                Dites-nous combien d&apos;enfants vous accueillez, à quelle fréquence et vos besoins particuliers. On vous revient avec
                une formule adaptée.
              </p>
            </div>
            <ButtonLink href="/soumission" variant="accent" size="lg" arrow className="mt-10 self-start">
              Demander une soumission
            </ButtonLink>
          </div>
        </div>
      </Container>
    </>
  );
}
