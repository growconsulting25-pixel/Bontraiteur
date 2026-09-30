import { HowItWorksView } from "@/views/HowItWorksView";
import { pageMetadata } from "@/lib/seo";

// Menu lu depuis Supabase : page régénérée au plus toutes les heures.
export const revalidate = 3600;

export const metadata = pageMetadata("howItWorks", "fr");

export default function Page() {
  return <HowItWorksView locale="fr" />;
}
