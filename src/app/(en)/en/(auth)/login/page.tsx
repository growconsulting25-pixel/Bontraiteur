import { LoginView } from "@/views/LoginView";
import { pageMetadata } from "@/lib/seo";

export const metadata = { ...pageMetadata("login", "en"), robots: { index: false, follow: true } };

export default function Page() {
  return <LoginView locale="en" />;
}
