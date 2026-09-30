import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { DashboardPreview } from "@/components/portal/DashboardPreview";
import { LoginForm } from "./LoginForm";
import { site } from "@/data/site";

export const metadata = {
  title: "Connexion au portail client",
  description: "Accédez à votre portail client Bon Traiteur : menu, livraisons, factures.",
  robots: { index: false, follow: true },
};

/**
 * Écran de connexion — préparatoire.
 * Sera branché sur Supabase Auth (courriel + mot de passe, ou lien magique).
 * Les routes du portail vivront sous src/app/(portal)/… protégées par un
 * contrôle de session côté serveur.
 */
export default function LoginPage() {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="flex flex-col px-gutter py-8">
        <div className="flex items-center justify-between">
          <Link href="/" aria-label="Bon Traiteur — accueil">
            <Logo className="text-[1.35rem]" />
          </Link>
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-charcoal">
            <ArrowLeft aria-hidden="true" className="size-4" /> Retour au site
          </Link>
        </div>

        <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-16">
          <p className="eyebrow flex items-center gap-2 text-coral-ink">
            <Lock aria-hidden="true" className="size-3.5" /> Portail client
          </p>
          <h1 className="mt-4 text-[clamp(2.2rem,1.8rem+1.6vw,3rem)] font-extrabold">
            Bon retour <span className="accent-serif text-olive">parmi nous.</span>
          </h1>
          <p className="mt-3 text-ink-soft">Votre menu, vos livraisons et vos factures, au même endroit.</p>

          <div className="mt-6 rounded-[var(--radius-md)] bg-saffron-soft p-4 text-sm">
            <p className="font-semibold">Le portail client ouvre bientôt.</p>
            <p className="mt-1 text-ink-soft">
              En attendant, notre équipe s&apos;occupe de tout :{" "}
              <a className="font-semibold text-charcoal underline" href={site.contact.phoneHref}>
                {site.contact.phone}
              </a>
              .
            </p>
          </div>

          <LoginForm />

          <p className="mt-8 text-sm text-ink-soft">
            Pas encore client?{" "}
            <Link href="/soumission" className="font-semibold text-charcoal underline underline-offset-4">
              Demander une soumission
            </Link>
          </p>
        </main>
      </div>

      <div className="relative hidden overflow-hidden bg-olive lg:flex lg:items-center lg:justify-center lg:p-12">
        <div aria-hidden="true" className="absolute -top-40 -right-40 size-[36rem] rounded-full border-[3rem] border-cream/10" />
        <div className="relative w-full max-w-xl">
          <p className="mb-6 font-display text-3xl leading-tight font-bold text-cream">
            Confirmez votre menu. <span className="accent-serif text-saffron">En un clic.</span>
          </p>
          <DashboardPreview />
        </div>
      </div>
    </div>
  );
}
