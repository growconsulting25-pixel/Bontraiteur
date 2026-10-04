import { PortalThreadView } from "@/views/portal/PortalThreadView";

export const metadata = { title: "Support" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PortalThreadView locale="fr" id={id} />;
}
