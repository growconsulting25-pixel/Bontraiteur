import { AboutView } from "@/views/AboutView";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("about", "fr");

export default function Page() {
  return <AboutView locale="fr" />;
}
