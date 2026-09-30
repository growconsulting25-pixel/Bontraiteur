import { FaqView } from "@/views/FaqView";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("faq", "fr");

export default function Page() {
  return <FaqView locale="fr" />;
}
