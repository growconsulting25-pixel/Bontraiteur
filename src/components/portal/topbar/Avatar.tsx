import { cn } from "@/lib/cn";

/** Photo de profil, ou initiales sur fond de couleur. */
export function Avatar({ url, name, size = "md", className }: { url: string | null; name: string; size?: "sm" | "md" | "lg"; className?: string }) {
  const initials =
    name
      .replace(/@.*/, "")
      .split(/[\s._-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("") || "?";
  const dim = { sm: "size-8 text-xs", md: "size-10 text-sm", lg: "size-24 text-2xl" }[size];
  return url ? (
    // eslint-disable-next-line @next/next/no-img-element -- lien signé temporaire (bucket privé)
    <img src={url} alt="" className={cn("shrink-0 rounded-full object-cover ring-2 ring-paper", dim, className)} />
  ) : (
    <span aria-hidden="true" className={cn("grid shrink-0 place-items-center rounded-full bg-saffron font-display font-bold text-charcoal ring-2 ring-paper", dim, className)}>
      {initials}
    </span>
  );
}
