import { MenuView } from "@/views/MenuView";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("menu", "fr");

export default function Page() {
  return <MenuView locale="fr" />;
}
