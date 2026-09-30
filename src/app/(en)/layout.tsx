import "../globals.css";
import { RootDocument } from "@/components/layout/RootDocument";
import { rootMetadata } from "@/lib/root-metadata";

export { viewport } from "@/lib/root-metadata";
export const metadata = rootMetadata("en");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <RootDocument locale="en">{children}</RootDocument>;
}
