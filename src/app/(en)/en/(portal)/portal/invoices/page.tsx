import { PortalInvoicesView } from "@/views/portal/PortalInvoicesView";

export const metadata = { title: "Invoices" };

export default async function Page({ searchParams }: { searchParams: Promise<{ paiement?: string }> }) {
  const { paiement } = await searchParams;
  return <PortalInvoicesView locale="en" payment={paiement} />;
}
