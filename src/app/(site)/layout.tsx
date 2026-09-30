import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SupportWidget } from "@/components/support/SupportWidget";
import { JsonLd, organizationSchema } from "@/lib/seo";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-full focus:bg-charcoal focus:px-5 focus:py-3 focus:text-cream"
      >
        Aller au contenu
      </a>
      <Navbar />
      <main id="contenu">{children}</main>
      <Footer />
      <SupportWidget />
      <JsonLd data={organizationSchema()} />
    </>
  );
}
