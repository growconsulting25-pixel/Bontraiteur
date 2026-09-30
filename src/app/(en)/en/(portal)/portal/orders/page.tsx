import { PortalOrdersView } from "@/views/portal/PortalOrdersView";

export const metadata = { title: "Orders" };

export default async function Page({ searchParams }: { searchParams: Promise<{ envoyee?: string }> }) {
  const { envoyee } = await searchParams;
  return <PortalOrdersView locale="en" sent={envoyee === "1"} />;
}
