import "./globals.css";
import type { Metadata } from "next";
import { RootDocument } from "@/components/layout/RootDocument";
import { SiteShell } from "@/components/layout/SiteShell";
import { ButtonLink } from "@/components/ui/Button";
import { PageHero } from "@/components/sections/PageHero";
import { getDictionary, href } from "@/i18n";

export const metadata: Metadata = { title: "404 | Bon Traiteur", robots: { index: false } };

/** 404 globale (le site a deux mises en page racines : FR et EN). Affichée en français, avec lien vers l'accueil anglais. */
export default function GlobalNotFound() {
  const t = getDictionary("fr").notFound;
  const en = getDictionary("en").notFound;
  return (
    <RootDocument locale="fr">
      <SiteShell locale="fr">
        <PageHero eyebrow={t.eyebrow} title={t.title} lead={t.lead}>
          <div className="mt-10 flex flex-col gap-3 pb-20 sm:flex-row">
            <ButtonLink href={href("home", "fr")} arrow>
              {t.home}
            </ButtonLink>
            <ButtonLink href={href("menu", "fr")} variant="secondary">
              {t.menu}
            </ButtonLink>
            <ButtonLink href={href("home", "en")} variant="ghost" lang="en" hrefLang="en">
              {en.home} (English)
            </ButtonLink>
          </div>
        </PageHero>
      </SiteShell>
    </RootDocument>
  );
}
