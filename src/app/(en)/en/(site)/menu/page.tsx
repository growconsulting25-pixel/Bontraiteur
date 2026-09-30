import { MenuView } from "@/views/MenuView";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("menu", "en");

export default function Page() {
  return <MenuView locale="en" />;
}
