import { Home, CalendarDays, ShoppingBag, Truck, Receipt, FolderOpen, LifeBuoy, Check, ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Aperçu statique du futur portail client (écran « Accueil »).
 * Principe directeur : ULTRA SIMPLE. Quatre informations, une action.
 * Garderie et données fictives — affichées comme « Exemple ».
 */

const sidebar = [
  { label: "Accueil", icon: Home, active: true },
  { label: "Mon menu", icon: CalendarDays },
  { label: "Commandes", icon: ShoppingBag },
  { label: "Livraisons", icon: Truck },
  { label: "Factures", icon: Receipt },
  { label: "Documents", icon: FolderOpen },
  { label: "Support", icon: LifeBuoy },
];

export function DashboardPreview({ className }: { className?: string }) {
  return (
    <div
      className={cn("overflow-hidden rounded-[var(--radius-xl)] bg-paper text-charcoal shadow-[var(--shadow-lift)] ring-1 ring-black/5", className)}
      aria-label="Aperçu du futur portail client Bon Traiteur (exemple)"
      role="img"
    >
      {/* Barre de fenêtre */}
      <div className="flex items-center gap-1.5 border-b border-line bg-cream/70 px-4 py-3" aria-hidden="true">
        <span className="size-2.5 rounded-full bg-coral/70" />
        <span className="size-2.5 rounded-full bg-saffron" />
        <span className="size-2.5 rounded-full bg-olive/60" />
        <span className="ml-3 rounded-full bg-paper px-3 py-0.5 text-[0.65rem] text-ink-soft ring-1 ring-line">portail.bontraiteur.com</span>
      </div>

      <div className="grid grid-cols-[auto_1fr]" aria-hidden="true">
        <nav className="hidden w-44 flex-col gap-0.5 border-r border-line p-3 sm:flex">
          {sidebar.map(({ label, icon: Icon, active }) => (
            <span
              key={label}
              className={cn(
                "flex items-center gap-2.5 rounded-[var(--radius-sm)] px-2.5 py-2 text-[0.8rem] font-medium",
                active ? "bg-olive text-cream" : "text-ink-soft",
              )}
            >
              <Icon className="size-4" /> {label}
            </span>
          ))}
        </nav>

        <div className="p-4 sm:p-6">
          <p className="text-[0.7rem] font-bold tracking-[0.12em] text-coral-ink uppercase">Exemple</p>
          <p className="mt-1 font-display text-xl leading-tight font-bold sm:text-2xl">
            Bonjour, Garderie Les Petits Explorateurs
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Tile label="Prochaine livraison" value="Jeudi 8 octobre" sub="Repas chauds · 42 portions" />
            <Tile
              label="Menu d'octobre"
              value={
                <span className="inline-flex items-center gap-1.5 text-olive">
                  <Check className="size-4" strokeWidth={3} /> Confirmé
                </span>
              }
              sub="Aucune action requise"
            />
            <div className="rounded-[var(--radius-md)] bg-saffron p-4 sm:col-span-2">
              <p className="text-[0.7rem] font-bold tracking-[0.1em] uppercase">Prochaine action</p>
              <div className="mt-1 flex items-center justify-between gap-3">
                <p className="leading-snug font-semibold">Menu de novembre à confirmer avant le 16 octobre</p>
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-charcoal text-cream">
                  <ArrowRight className="size-4" />
                </span>
              </div>
            </div>
            <Tile
              label="Facture BT-1094"
              value={<span className="inline-flex items-center gap-1.5 rounded-full bg-olive-soft px-2 py-0.5 text-sm text-olive-deep">Payée</span>}
              sub="Septembre"
              className="sm:col-span-2"
              inline
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Tile({
  label,
  value,
  sub,
  className,
  inline,
}: {
  label: string;
  value: React.ReactNode;
  sub: string;
  className?: string;
  inline?: boolean;
}) {
  return (
    <div className={cn("rounded-[var(--radius-md)] bg-cream/70 p-4 ring-1 ring-line", inline && "flex items-center justify-between gap-3", className)}>
      <div>
        <p className="text-[0.7rem] font-bold tracking-[0.1em] text-ink-soft uppercase">{label}</p>
        {!inline && <p className="mt-1 font-display text-lg font-bold">{value}</p>}
        <p className="text-xs text-ink-soft">{sub}</p>
      </div>
      {inline && <div className="font-semibold">{value}</div>}
    </div>
  );
}
