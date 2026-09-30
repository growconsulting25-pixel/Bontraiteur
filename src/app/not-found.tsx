import { ButtonLink } from "@/components/ui/Button";
import { PageHero } from "@/components/sections/PageHero";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function NotFound() {
  return (
    <>
    <Navbar />
    <main id="contenu">
    <PageHero eyebrow="Erreur 404" title={<>Cette page <em>n&apos;est pas au menu.</em></>} lead="Elle a peut-être été déplacée. Voici où aller :">
      <div className="mt-10 flex flex-col gap-3 pb-20 sm:flex-row">
        <ButtonLink href="/" arrow>
          Retour à l&apos;accueil
        </ButtonLink>
        <ButtonLink href="/menu" variant="secondary">
          Voir le menu
        </ButtonLink>
      </div>
    </PageHero>
    </main>
    <Footer />
    </>
  );
}
