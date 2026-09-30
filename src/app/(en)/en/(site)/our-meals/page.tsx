import { MealsView } from "@/views/MealsView";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("meals", "en");

export default function Page() {
  return <MealsView locale="en" />;
}
