import Link from "next/link";
import { LogOut } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { AdminNav } from "@/components/admin/AdminNav";
import { requireStaff } from "@/lib/auth";
import { signOut } from "@/lib/actions/auth";

export const metadata = { title: { default: "Back-office", template: "%s | Back-office Bon Traiteur" }, robots: { index: false, follow: false } };

/** Back-office interne Bon Traiteur (équipe seulement, en français). */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const account = await requireStaff();
  return (
    <div className="min-h-dvh bg-cream lg:grid lg:grid-cols-[15rem_1fr]">
      <aside className="border-b border-line bg-paper px-4 py-4 lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:gap-6 lg:border-r lg:border-b-0 lg:py-6">
        <div className="mb-3 flex items-center justify-between lg:mb-0 lg:block">
          <Link href="/admin" aria-label="Back-office">
            <Logo className="text-[1.1rem]" />
          </Link>
          <p className="text-[0.7rem] font-bold tracking-[0.12em] text-coral-ink uppercase lg:mt-2">Back-office</p>
        </div>
        <AdminNav />
        <div className="mt-4 hidden text-sm lg:mt-auto lg:block">
          <p className="truncate font-semibold">{account.user.email}</p>
          <div className="mt-2 flex gap-4 text-ink-soft">
            <Link href="/" className="hover:text-charcoal">Site</Link>
            {account.establishments.length > 0 && <Link href="/portail" className="hover:text-charcoal">Portail</Link>}
          </div>
          <form action={signOut} className="mt-3">
            <button type="submit" className="inline-flex items-center gap-2 font-semibold text-ink-soft hover:text-charcoal">
              <LogOut aria-hidden="true" className="size-4" /> Se déconnecter
            </button>
          </form>
        </div>
      </aside>
      <main id="contenu" className="min-w-0 px-4 py-8 sm:px-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
