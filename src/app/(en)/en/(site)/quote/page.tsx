import { QuoteView } from "@/views/QuoteView";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("quote", "en");

export default function Page() {
  return <QuoteView locale="en" />;
}
