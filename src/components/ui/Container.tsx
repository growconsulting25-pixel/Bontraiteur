import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Container({
  as: Tag = "div",
  size = "default",
  className,
  children,
}: {
  as?: ElementType;
  size?: "default" | "narrow" | "wide";
  className?: string;
  children: ReactNode;
}) {
  const max = { narrow: "max-w-4xl", default: "max-w-[82rem]", wide: "max-w-[96rem]" }[size];
  return <Tag className={cn("mx-auto w-full px-gutter", max, className)}>{children}</Tag>;
}
