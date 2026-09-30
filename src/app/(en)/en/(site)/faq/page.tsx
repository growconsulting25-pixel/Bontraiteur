import { FaqView } from "@/views/FaqView";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("faq", "en");

export default function Page() {
  return <FaqView locale="en" />;
}
