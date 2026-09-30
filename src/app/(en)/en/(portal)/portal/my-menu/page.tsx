import { PortalMenuView } from "@/views/portal/PortalMenuView";

export const metadata = { title: "My menu" };

export default async function Page({ searchParams }: { searchParams: Promise<{ mois?: string }> }) {
  const { mois } = await searchParams;
  return <PortalMenuView locale="en" month={mois} />;
}
