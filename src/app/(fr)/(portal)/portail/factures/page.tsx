import { PortalInvoicesView } from "@/views/portal/PortalInvoicesView";

export const metadata = { title: "Factures" };

export default async function Page({ searchParams }: { searchParams: Promise<{ paiement?: string }> }) {
  const { paiement } = await searchParams;
  return <PortalInvoicesView locale="fr" payment={paiement} />;
}
