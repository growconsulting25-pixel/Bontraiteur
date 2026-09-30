import { redirect } from "next/navigation";
import { LoginView } from "@/views/LoginView";
import { pageMetadata } from "@/lib/seo";
import { getUser } from "@/lib/auth";

export const metadata = { ...pageMetadata("login", "en"), robots: { index: false, follow: true } };

export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  // Déjà connecté : directement au portail
  if (await getUser()) redirect(next?.startsWith("/") && !next.startsWith("//") ? next : "/en/portal");
  return <LoginView locale="en" next={next} linkError={error === "link"} />;
}
