import { PortalThreadView } from "@/views/portal/PortalThreadView";

export const metadata = { title: "Messages" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PortalThreadView locale="en" id={id} />;
}
