import { MealsView } from "@/views/MealsView";
import { pageMetadata } from "@/lib/seo";

// Menu lu depuis Supabase : page régénérée au plus toutes les heures.
export const revalidate = 3600;

export const metadata = pageMetadata("meals", "fr");

export default function Page() {
  return <MealsView locale="fr" />;
}
