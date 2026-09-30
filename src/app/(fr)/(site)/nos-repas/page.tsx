import { MealsView } from "@/views/MealsView";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("meals", "fr");

export default function Page() {
  return <MealsView locale="fr" />;
}
