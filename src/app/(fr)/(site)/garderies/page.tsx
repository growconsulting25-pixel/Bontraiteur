import { DaycaresView } from "@/views/DaycaresView";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("daycares", "fr");

export default function Page() {
  return <DaycaresView locale="fr" />;
}
