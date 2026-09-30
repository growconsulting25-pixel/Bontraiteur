import { HomeView } from "@/views/HomeView";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("home", "en", { absoluteTitle: true });

export default function Page() {
  return <HomeView locale="en" />;
}
