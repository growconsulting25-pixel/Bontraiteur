"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, Phone } from "lucide-react";
import { mainNav, site } from "@/data/site";
import { Logo } from "@/components/ui/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

export function Navbar() {
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

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-300",
        scrolled || open ? "bg-cream/92 shadow-[0_1px_0_var(--color-line)] backdrop-blur-md" : "bg-cream",
      )}
    >
      <div className="mx-auto flex h-[4.5rem] max-w-[82rem] items-center justify-between gap-6 px-gutter lg:h-20">
        <Link href="/" aria-label="Bon Traiteur — accueil" className="shrink-0 rounded-md">
          <Logo className="text-[1.3rem] lg:text-[1.45rem]" />
        </Link>

        <nav aria-label="Navigation principale" className="hidden xl:block">
          <ul className="flex items-center gap-1">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "relative rounded-full px-3.5 py-2 text-[0.94rem] font-medium transition-colors",
                    isActive(item.href) ? "text-charcoal" : "text-ink-soft hover:text-charcoal",
                  )}
                >
                  {item.label}
                  {isActive(item.href) && (
                    <span aria-hidden="true" className="absolute inset-x-3.5 -bottom-0.5 h-0.5 rounded-full bg-coral" />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden rounded-full px-4 py-2 text-[0.94rem] font-semibold text-charcoal transition-colors hover:bg-charcoal/[0.06] md:inline-flex"
          >
            Connexion
          </Link>
          <div className="hidden sm:block">
            <ButtonLink href="/soumission" size="sm">
              Demander une soumission
            </ButtonLink>
          </div>
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-full text-charcoal hover:bg-charcoal/[0.06] xl:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {/* Navigation mobile / tablette */}
      <div
        id="mobile-nav"
        hidden={!open}
        className="fixed inset-x-0 top-[4.5rem] bottom-0 overflow-y-auto bg-cream lg:top-20 xl:hidden"
      >
        <nav aria-label="Navigation mobile" className="mx-auto flex min-h-full max-w-[82rem] flex-col px-gutter pt-4 pb-8">
          <ul className="divide-y divide-line border-y border-line">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className="flex items-center justify-between py-4 font-display text-[1.6rem] font-bold tracking-tight"
                >
                  {item.label}
                  {isActive(item.href) && <span aria-hidden="true" className="size-2.5 rounded-full bg-coral" />}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-auto grid gap-3 pt-8">
            <ButtonLink href="/soumission" size="lg" arrow>
              Demander une soumission
            </ButtonLink>
            <ButtonLink href="/login" size="lg" variant="secondary">
              Connexion client
            </ButtonLink>
            <a href={site.contact.phoneHref} className="mt-2 inline-flex items-center justify-center gap-2 py-2 text-sm font-semibold text-ink-soft">
              <Phone aria-hidden="true" className="size-4" /> {site.contact.phone}
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}
