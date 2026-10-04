import { Check } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { Photo } from "@/components/ui/Photo";
import { Stamp } from "@/components/ui/Stamp";
import { getDictionary, href, type Locale } from "@/i18n";

export function Hero({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).home.hero;
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden pt-8 pb-12 sm:pt-12 lg:pt-16 lg:pb-14">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-10 xl:gap-16">
          <div>
            <p className="eyebrow flex items-center gap-3 text-coral-ink">
              <span aria-hidden="true" className="inline-block h-px w-8 bg-current" />
              {t.eyebrow}
            </p>
            <h1 id="hero-title" className="mt-6 text-[clamp(2.4rem,1.5rem+3.6vw,4.6rem)] font-extrabold">
              {t.titleLine1} <span className="accent-serif block pt-1 text-[1.04em] text-olive">{t.titleLine2}</span>
            </h1>
            <p className="text-lead mt-7 max-w-xl text-ink-soft">{t.lead}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href={href("menu", locale)} size="lg" arrow>
                {t.ctaMenu}
              </ButtonLink>
              <ButtonLink href={href("quote", locale)} size="lg" variant="secondary">
                {t.ctaQuote}
              </ButtonLink>
            </div>
          </div>

          {/* Composition photo */}
          <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
            <Photo
              slot="heroMain"
              locale={locale}
              priority
              className="aspect-[1/1] rounded-[var(--radius-2xl)] sm:aspect-[5/5.2]"
              sizes="(min-width: 1024px) 45vw, 90vw"
            />
            <div className="absolute -bottom-8 -left-3 w-[46%] sm:-left-8">
              <Photo
                slot="heroMeal"
                locale={locale}
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
                <span className="block font-semibold">{t.statusTitle}</span>
                <span className="block text-ink-soft">{t.statusSub}</span>
              </span>
            </div>
            <div className="absolute -right-4 -bottom-12 hidden sm:block lg:-right-6">
              <Stamp text={t.stamp} center="15+" />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
