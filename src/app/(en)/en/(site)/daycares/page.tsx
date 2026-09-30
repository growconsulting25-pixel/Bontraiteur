import { DaycaresView } from "@/views/DaycaresView";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("daycares", "en");

export default function Page() {
  return <DaycaresView locale="en" />;
}
