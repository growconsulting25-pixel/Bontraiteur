import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { Assistant } from "@/components/assistant/Assistant";
import { getDictionary, type Locale } from "@/i18n";
import { JsonLd, organizationSchema, websiteSchema } from "@/lib/seo";

/** Habillage commun des pages publiques (FR et EN). */
export function SiteShell({ locale, children }: { locale: Locale; children: ReactNode }) {
  const t = getDictionary(locale);
  return (
    <>
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-full focus:bg-charcoal focus:px-5 focus:py-3 focus:text-cream"
      >
        {t.nav.skipToContent}
      </a>
      <Navbar locale={locale} t={t.nav} />
      <main id="contenu">{children}</main>
      <Footer locale={locale} />
      <Assistant mode="site" locale={locale} />
      <JsonLd data={organizationSchema(locale)} />
      <JsonLd data={websiteSchema(locale)} />
    </>
  );
}
