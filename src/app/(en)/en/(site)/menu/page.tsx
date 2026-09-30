import { MenuView } from "@/views/MenuView";
import { pageMetadata } from "@/lib/seo";

// Menu lu depuis Supabase : page régénérée au plus toutes les heures.
export const revalidate = 3600;

export const metadata = pageMetadata("menu", "en");

export default function Page() {
  return <MenuView locale="en" />;
}
