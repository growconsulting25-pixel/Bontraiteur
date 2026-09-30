import { PortalMenuView } from "@/views/portal/PortalMenuView";

export const metadata = { title: "Mon menu" };

export default async function Page({ searchParams }: { searchParams: Promise<{ mois?: string }> }) {
  const { mois } = await searchParams;
  return <PortalMenuView locale="fr" month={mois} />;
}
