import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { rich } from "@/i18n";

/** En-tête standard des pages intérieures. `title` accepte `*accent*`. */
export function PageHero({ eyebrow, title, lead, children }: { eyebrow: string; title: string; lead?: string; children?: ReactNode }) {
  return (
    <section className="pt-10 pb-14 sm:pt-16 sm:pb-20">
      <Container>
        <p className="eyebrow flex items-center gap-3 text-coral-ink">
          <span aria-hidden="true" className="inline-block h-px w-8 bg-current" />
          {eyebrow}
        </p>
        <h1 className="mt-6 max-w-5xl text-[clamp(2.4rem,1.6rem+3.4vw,4.75rem)] font-extrabold [&_em]:accent-serif [&_em]:text-olive">
          {rich(title)}
        </h1>
        {lead && <p className="text-lead mt-7 max-w-2xl text-ink-soft">{lead}</p>}
        {children}
      </Container>
    </section>
  );
}
