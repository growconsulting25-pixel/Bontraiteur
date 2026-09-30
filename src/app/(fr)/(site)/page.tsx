import { HomeView } from "@/views/HomeView";
import { pageMetadata } from "@/lib/seo";

// Menu lu depuis Supabase : page régénérée au plus toutes les heures.
export const revalidate = 3600;

export const metadata = pageMetadata("home", "fr", { absoluteTitle: true });

export default function Page() {
  return <HomeView locale="fr" />;
}
