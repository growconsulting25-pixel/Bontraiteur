import { ArrowRight, Zap } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { FormatCard } from "@/components/cards/FormatCard";
import Link from "next/link";
import { getDictionary, href, type Locale } from "@/i18n";
import { cn } from "@/lib/cn";

/** Nos formules : 3 formats de repas × 3 façons de commander. */
export function Formulas({ locale, showHeading = true }: { locale: Locale; showHeading?: boolean }) {
  const d = getDictionary(locale);
  const t = d.home.formulas;
  return (
    <Section tone="paper" labelledBy={showHeading ? "formulas-title" : undefined}>
      <Container>
        {showHeading && <SectionHeading id="formulas-title" eyebrow={t.eyebrow} title={t.title} lead={t.lead} />}

        <div className={cn("grid gap-5 md:grid-cols-3", showHeading && "mt-14")}>
          {d.formats.map((format, i) => (
            <Reveal key={format.id} delay={i * 80}>
              <FormatCard format={format} index={i} locale={locale} />
            </Reveal>
          ))}
        </div>

        <h3 className="mt-20 font-display text-h3 font-bold">{t.modesTitle}</h3>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {d.serviceModes.map((mode, i) => (
            <Reveal key={mode.id} delay={i * 80}>
              <Link
                href={`${href("quote", locale)}?type=${mode.id}`}
                className={cn(
                  "group flex h-full flex-col rounded-[var(--radius-xl)] p-7 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)] sm:p-8",
                  mode.highlight ? "bg-coral text-charcoal" : "bg-cream ring-1 ring-line hover:ring-charcoal",
                )}
              >
                <div className="flex items-center justify-between">
                  <p className="font-display text-h3 font-bold">{mode.title}</p>
                  {mode.highlight && <Zap aria-hidden="true" className="size-6" strokeWidth={2.25} />}
                </div>
                <p className={cn("mt-3 flex-1", mode.highlight ? "text-charcoal/85" : "text-ink-soft")}>{mode.summary}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold">
                  {t.modeCta}
                  <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
