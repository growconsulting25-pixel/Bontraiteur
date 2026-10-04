import { Phone, Mail, Clock } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { PageHero } from "@/components/sections/PageHero";
import { site } from "@/data/site";
import { OpenAssistantButton } from "@/components/assistant/OpenAssistantButton";
import { getDictionary, href, type Locale } from "@/i18n";

export function ContactView({ locale }: { locale: Locale }) {
  const d = getDictionary(locale);
  const t = d.contactPage;

  return (
    <>
      <PageHero eyebrow={t.eyebrow} title={t.title} lead={t.lead} />
      <Container className="pb-section">
        <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <ul className="grid content-start gap-4 sm:grid-cols-2">
            <li className="rounded-[var(--radius-xl)] bg-paper p-7 ring-1 ring-line">
              <Phone aria-hidden="true" className="size-6 text-coral-ink" />
              <p className="eyebrow mt-6 text-ink-soft">{t.phones}</p>
              {site.contact.phones.map((p) => (
                <a key={p.href} href={p.href} className="mt-2 block font-display text-xl font-bold hover:text-olive">
                  {p.display}
                </a>
              ))}
            </li>
            <li className="rounded-[var(--radius-xl)] bg-paper p-7 ring-1 ring-line">
              <Mail aria-hidden="true" className="size-6 text-coral-ink" />
              <p className="eyebrow mt-6 text-ink-soft">{t.email}</p>
              <a href={`mailto:${site.contact.email}`} className="mt-2 block font-display text-xl font-bold break-words hover:text-olive">
                {site.contact.email}
              </a>
            </li>
            <li className="rounded-[var(--radius-xl)] bg-paper p-7 ring-1 ring-line sm:col-span-2">
              <Clock aria-hidden="true" className="size-6 text-coral-ink" />
              <p className="eyebrow mt-6 text-ink-soft">{t.hours}</p>
              <p className="mt-2 font-display text-xl font-bold">{d.contact.hours}</p>
            </li>
          </ul>
          <div className="grid gap-6">
          <div className="flex flex-col justify-between rounded-[var(--radius-xl)] bg-olive p-8 text-cream sm:p-10">
            <div>
              <p className="font-display text-h3 font-bold">{t.newTitle}</p>
              <p className="mt-3 text-cream/85">{t.newText}</p>
            </div>
            <ButtonLink href={href("quote", locale)} variant="accent" size="lg" arrow className="mt-10 self-start">
              {d.nav.quote}
            </ButtonLink>
          </div>
          <div className="rounded-[var(--radius-xl)] bg-saffron-soft p-8 sm:p-10">
            <p className="font-display text-h3 font-bold">{t.chatTitle}</p>
            <p className="mt-3 text-ink-soft">{t.chatText}</p>
            <OpenAssistantButton label={t.chatButton} dark className="mt-6" />
          </div>
          </div>
        </div>
      </Container>
    </>
  );
}
