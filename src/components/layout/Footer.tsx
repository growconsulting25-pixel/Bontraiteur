import Link from "next/link";
import { site } from "@/data/site";
import { Logo } from "@/components/ui/Logo";
import { Container } from "@/components/ui/Container";
import { getDictionary, href, type Locale, type RouteKey } from "@/i18n";

export function Footer({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const f = t.footer;
  return (
    <footer className="bg-charcoal text-cream">
      <Container className="pt-20 pb-10">
        <div className="grid gap-14 lg:grid-cols-[1.2fr_2fr]">
          <div className="max-w-sm">
            <Logo tone="light" className="text-[1.7rem]" />
            <p className="mt-6 text-cream/75">{f.tagline}</p>
            <dl className="mt-8 grid gap-3 text-sm">
              <div>
                <dt className="sr-only">{f.phoneLabel}</dt>
                {site.contact.phones.map((p) => (
                  <dd key={p.href}>
                    <a className="font-semibold hover:text-saffron" href={p.href}>
                      {p.display}
                    </a>
                  </dd>
                ))}
              </div>
              <div>
                <dt className="sr-only">{f.emailLabel}</dt>
                <dd>
                  <a className="font-semibold hover:text-saffron" href={`mailto:${site.contact.email}`}>
                    {site.contact.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="sr-only">{f.hoursLabel}</dt>
                <dd className="text-cream/70">{t.contact.hours}</dd>
              </div>
            </dl>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            {f.groups.map((group) => (
              <nav key={group.title} aria-label={group.title}>
                <h2 className="eyebrow text-saffron">{group.title}</h2>
                <ul className="mt-5 grid gap-3">
                  {group.items.map((item) => (
                    <li key={item.key}>
                      <Link href={href(item.key as RouteKey, locale)} className="text-cream/80 transition-colors hover:text-cream">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-20 flex flex-col gap-4 border-t border-cream/15 pt-8 text-sm text-cream/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Bon Traiteur. {f.rights}
          </p>
          <p>{f.bottomNote}</p>
        </div>
      </Container>
    </footer>
  );
}
