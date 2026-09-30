import { HomeView } from "@/views/HomeView";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("home", "fr", { absoluteTitle: true });

export default function Page() {
  return <HomeView locale="fr" />;
}
