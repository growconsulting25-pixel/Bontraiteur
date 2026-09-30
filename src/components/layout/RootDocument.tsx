import type { ReactNode } from "react";
import { fontVariables } from "@/lib/fonts";
import { htmlLang, type Locale } from "@/i18n/config";

/** Document HTML racine, partagé par les deux langues (chacune a sa propre racine). */
export function RootDocument({ locale, children }: { locale: Locale; children: ReactNode }) {
  return (
    <html lang={htmlLang[locale]} className={`no-js ${fontVariables}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.remove('no-js')" }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
