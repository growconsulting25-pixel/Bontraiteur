import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "accent" | "ghost" | "light";
type Size = "md" | "lg" | "sm";

const variants: Record<Variant, string> = {
  primary: "bg-charcoal text-cream hover:bg-olive-deep",
  secondary: "bg-transparent text-charcoal ring-1 ring-inset ring-charcoal/25 hover:ring-charcoal hover:bg-charcoal/[0.04]",
  accent: "bg-coral text-charcoal hover:bg-saffron",
  ghost: "bg-transparent text-charcoal hover:bg-charcoal/[0.06]",
  light: "bg-cream text-charcoal hover:bg-saffron",
};

const sizes: Record<Size, string> = {
  sm: "h-10 px-4 text-sm",
  md: "h-12 px-6 text-[0.95rem]",
  lg: "h-14 px-7 text-base",
};

const base =
  "group/btn inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-[-0.005em] whitespace-nowrap transition-[background-color,color,box-shadow,transform] duration-300 ease-[var(--ease-out-soft)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50";

interface CommonProps {
  variant?: Variant;
  size?: Size;
  /** Affiche la flèche animée à droite. */
  arrow?: boolean;
  className?: string;
  children: ReactNode;
}

function Content({ children, arrow }: { children: ReactNode; arrow?: boolean }) {
  return (
    <>
      {children}
      {arrow && (
        <ArrowRight
          aria-hidden="true"
          className="size-4 transition-transform duration-300 group-hover/btn:translate-x-0.5"
          strokeWidth={2.25}
        />
      )}
    </>
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  arrow,
  className,
  children,
  ...rest
}: CommonProps & Omit<ComponentProps<typeof Link>, "className" | "children">) {
  return (
    <Link href={href} className={cn(base, variants[variant], sizes[size], className)} {...rest}>
      <Content arrow={arrow}>{children}</Content>
    </Link>
  );
}

export function Button({
  variant = "primary",
  size = "md",
  arrow,
  className,
  children,
  type = "button",
  ...rest
}: CommonProps & Omit<ComponentProps<"button">, "className" | "children">) {
  return (
    <button type={type} className={cn(base, variants[variant], sizes[size], className)} {...rest}>
      <Content arrow={arrow}>{children}</Content>
    </button>
  );
}
