"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, Phone } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { primaryPhone } from "@/data/site";
import { href, routeKeyFromPath, type RouteKey } from "@/i18n/routes";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/fr";
import { cn } from "@/lib/cn";

export function Navbar({ locale, t }: { locale: Locale; t: Dictionary["nav"] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Ferme le menu mobile au changement de page
  useEffect(() => setOpen(false), [pathname]);

  // Bloque le scroll + Échap pour fermer
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const home = href("home", locale);
  const isActive = (path: string) => (path === home ? pathname === home : pathname.startsWith(path));

  // Même page dans l'autre langue
  const otherLocale: Locale = locale === "fr" ? "en" : "fr";
  const currentKey = routeKeyFromPath(pathname) ?? "home";
  const switchHref = href(currentKey, otherLocale);

  const items = t.items.map((item) => ({ label: item.label, path: href(item.key as RouteKey, locale) }));

  const languageLink = (className?: string) => (
    <Link
      href={switchHref}
      hrefLang={otherLocale}
      lang={otherLocale}
      aria-label={t.switchLanguageAria}
      className={cn("rounded-full font-semibold text-ink-soft transition-colors hover:bg-charcoal/[0.06] hover:text-charcoal", className)}
    >
      {t.switchLanguage}
    </Link>
  );

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-300",
        scrolled || open ? "bg-cream/92 shadow-[0_1px_0_var(--color-line)] backdrop-blur-md" : "bg-cream",
      )}
    >
      <div className="mx-auto flex h-[4.5rem] max-w-[82rem] items-center justify-between gap-6 px-gutter lg:h-20">
        <Link href={home} aria-label={t.homeAria} className="shrink-0 rounded-md">
          <Logo className="text-[1.3rem] lg:text-[1.45rem]" />
        </Link>

        <nav aria-label={t.mainAria} className="hidden xl:block">
          <ul className="flex items-center gap-1">
            {items.map((item) => (
              <li key={item.path}>
                <Link
                  href={item.path}
                  aria-current={isActive(item.path) ? "page" : undefined}
                  className={cn(
                    "relative rounded-full px-3.5 py-2 text-[0.94rem] font-medium transition-colors",
                    isActive(item.path) ? "text-charcoal" : "text-ink-soft hover:text-charcoal",
                  )}
                >
                  {item.label}
                  {isActive(item.path) && <span aria-hidden="true" className="absolute inset-x-3.5 -bottom-0.5 h-0.5 rounded-full bg-coral" />}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1.5">
          <div className="hidden md:block">{languageLink("inline-flex px-3 py-2 text-sm")}</div>
          <Link
            href={href("login", locale)}
            className="hidden rounded-full px-4 py-2 text-[0.94rem] font-semibold text-charcoal transition-colors hover:bg-charcoal/[0.06] md:inline-flex"
          >
            {t.login}
          </Link>
          <div className="hidden sm:block">
            <ButtonLink href={href("quote", locale)} size="sm">
              {t.quote}
            </ButtonLink>
          </div>
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-full text-charcoal hover:bg-charcoal/[0.06] xl:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? t.close : t.open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {/* Navigation mobile / tablette */}
      <div id="mobile-nav" hidden={!open} className="fixed inset-x-0 top-[4.5rem] bottom-0 overflow-y-auto bg-cream lg:top-20 xl:hidden">
        <nav aria-label={t.mobileAria} className="mx-auto flex min-h-full max-w-[82rem] flex-col px-gutter pt-4 pb-8">
          <ul className="divide-y divide-line border-y border-line">
            {items.map((item) => (
              <li key={item.path}>
                <Link
                  href={item.path}
                  aria-current={isActive(item.path) ? "page" : undefined}
                  className="flex items-center justify-between py-4 font-display text-[1.6rem] font-bold tracking-tight"
                >
                  {item.label}
                  {isActive(item.path) && <span aria-hidden="true" className="size-2.5 rounded-full bg-coral" />}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-auto grid gap-3 pt-8">
            <ButtonLink href={href("quote", locale)} size="lg" arrow>
              {t.quote}
            </ButtonLink>
            <ButtonLink href={href("login", locale)} size="lg" variant="secondary">
              {t.loginLong}
            </ButtonLink>
            <div className="mt-2 flex items-center justify-center gap-4">
              <a href={primaryPhone.href} className="inline-flex items-center gap-2 py-2 text-sm font-semibold text-ink-soft">
                <Phone aria-hidden="true" className="size-4" /> {primaryPhone.display}
              </a>
              <span aria-hidden="true" className="h-4 w-px bg-line" />
              {languageLink("px-2 py-2 text-sm")}
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
