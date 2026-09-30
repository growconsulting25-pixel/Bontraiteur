import { QuoteView } from "@/views/QuoteView";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("quote", "fr");

export default function Page() {
  return <QuoteView locale="fr" />;
}
