import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { DashboardPreview } from "@/components/portal/DashboardPreview";
import { LoginForm } from "@/components/forms/LoginForm";
import { primaryPhone } from "@/data/site";
import { getDictionary, href, type Locale } from "@/i18n";

/**
 * Écran de connexion — préparatoire.
 * Sera branché sur Supabase Auth (courriel + mot de passe, ou lien magique).
 */
export function LoginView({ locale }: { locale: Locale }) {
  const d = getDictionary(locale);
  const t = d.loginPage;
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="flex flex-col px-gutter py-8">
        <div className="flex items-center justify-between">
          <Link href={href("home", locale)} aria-label={d.nav.homeAria}>
            <Logo className="text-[1.35rem]" />
          </Link>
          <Link href={href("home", locale)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-charcoal">
            <ArrowLeft aria-hidden="true" className="size-4" /> {t.back}
          </Link>
        </div>

        <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-16">
          <p className="eyebrow flex items-center gap-2 text-coral-ink">
            <Lock aria-hidden="true" className="size-3.5" /> {t.eyebrow}
          </p>
          <h1 className="mt-4 text-[clamp(2.2rem,1.8rem+1.6vw,3rem)] font-extrabold">
            {t.title} <span className="accent-serif text-olive">{t.titleAccent}</span>
          </h1>
          <p className="mt-3 text-ink-soft">{t.lead}</p>

          <div className="mt-6 rounded-[var(--radius-md)] bg-saffron-soft p-4 text-sm">
            <p className="font-semibold">{t.soonTitle}</p>
            <p className="mt-1 text-ink-soft">
              {t.soonText}{" "}
              <a className="font-semibold text-charcoal underline" href={primaryPhone.href}>
                {primaryPhone.display}
              </a>
              .
            </p>
          </div>

          <LoginForm t={t} />

          <p className="mt-8 text-sm text-ink-soft">
            {t.notClient}{" "}
            <Link href={href("quote", locale)} className="font-semibold text-charcoal underline underline-offset-4">
              {d.nav.quote}
            </Link>
          </p>
        </main>
      </div>

      <div className="relative hidden overflow-hidden bg-olive lg:flex lg:items-center lg:justify-center lg:p-12">
        <div aria-hidden="true" className="absolute -top-40 -right-40 size-[36rem] rounded-full border-[3rem] border-cream/10" />
        <div className="relative w-full max-w-xl">
          <p className="mb-6 font-display text-3xl leading-tight font-bold text-cream">
            {t.sideTitle} <span className="accent-serif text-saffron">{t.sideAccent}</span>
          </p>
          <DashboardPreview locale={locale} />
        </div>
      </div>
    </div>
  );
}
