import { PortalLayout } from "@/components/layout/PortalLayout";

export const metadata = { robots: { index: false, follow: false } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <PortalLayout locale="fr">{children}</PortalLayout>;
}
