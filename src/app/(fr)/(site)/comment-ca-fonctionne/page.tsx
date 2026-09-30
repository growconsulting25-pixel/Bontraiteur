import { HowItWorksView } from "@/views/HowItWorksView";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("howItWorks", "fr");

export default function Page() {
  return <HowItWorksView locale="fr" />;
}
