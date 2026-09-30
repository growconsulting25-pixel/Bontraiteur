import { PortalOrdersView } from "@/views/portal/PortalOrdersView";

export const metadata = { title: "Commandes" };

export default async function Page({ searchParams }: { searchParams: Promise<{ envoyee?: string }> }) {
  const { envoyee } = await searchParams;
  return <PortalOrdersView locale="fr" sent={envoyee === "1"} />;
}
