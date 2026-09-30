import { Check } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { Photo } from "@/components/ui/Photo";
import { Stamp } from "@/components/ui/Stamp";

const trust = ["15+ ans d'expérience", "Menus flexibles", "Livraison adaptée", "Service humain"];

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden pt-8 pb-16 sm:pt-12 lg:pt-16 lg:pb-24">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-10 xl:gap-16">
          <div>
            <p className="eyebrow flex items-center gap-3 text-coral-ink">
              <span aria-hidden="true" className="inline-block h-px w-8 bg-current" />
              Pour les CPE, garderies et services de garde
            </p>
            <h1 id="hero-title" className="mt-6 text-[clamp(2.4rem,1.5rem+3.6vw,4.6rem)] font-extrabold">
              Des repas qui plaisent aux enfants.{" "}
              <span className="accent-serif block pt-1 text-[1.04em] text-olive">Un service qui simplifie vos journées.</span>
            </h1>
            <p className="text-lead mt-7 max-w-xl text-ink-soft">
              Menus flexibles et service de livraison conçus pour les milieux de garde. Repas chauds, prêts-à-manger ou
              congelés. Commandes régulières, ponctuelles ou urgentes.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/menu" size="lg" arrow>
                Voir notre menu
              </ButtonLink>
              <ButtonLink href="/soumission" size="lg" variant="secondary">
                Demander une soumission
              </ButtonLink>
            </div>
          </div>

          {/* Composition photo */}
          <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
            <Photo
              slot="heroMain"
              priority
              className="aspect-[1/1] rounded-[var(--radius-2xl)] sm:aspect-[5/5.2]"
              sizes="(min-width: 1024px) 45vw, 90vw"
            />
            <div className="absolute -bottom-8 -left-3 w-[46%] sm:-left-8">
              <Photo
                slot="heroMeal"
                className="aspect-square rounded-[var(--radius-xl)] ring-[6px] ring-cream"
                sizes="(min-width: 1024px) 20vw, 45vw"
                showBrief={false}
              />
            </div>
            {/* Petite carte « état du menu » : fait le lien avec le portail */}
            <div className="absolute top-5 right-3 flex items-center gap-3 rounded-[var(--radius-md)] bg-paper py-3 pr-4 pl-3 shadow-[var(--shadow-lift)] sm:-right-6">
              <span className="flex size-9 items-center justify-center rounded-full bg-olive text-cream">
                <Check aria-hidden="true" className="size-4" strokeWidth={3} />
              </span>
              <span className="text-sm leading-tight">
                <span className="block font-semibold">Menu de novembre</span>
                <span className="block text-ink-soft">Confirmé en 1 clic</span>
              </span>
            </div>
            <div className="absolute -right-4 -bottom-12 hidden sm:block lg:-right-6">
              <Stamp text="Au service des garderies · Depuis plus de 15 ans · " center="15+" />
            </div>
          </div>
        </div>

        <ul className="mt-20 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-line pt-8 sm:mt-24 lg:grid-cols-4">
          {trust.map((item) => (
            <li key={item} className="flex items-center gap-2.5 font-semibold">
              <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-coral" />
              {item}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
