"use client";

import Image, { type ImageLoader } from "next/image";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Image avec repli : si la photo ne se charge pas (URL invalide, réseau),
 * on affiche `fallback` (le placeholder de marque) au lieu d'une image cassée.
 *
 * Les URL Unsplash sont redimensionnées par le CDN d'Unsplash (srcset
 * responsive) ; les photos locales passent par l'optimiseur Next.js.
 */
const unsplashLoader: ImageLoader = ({ src, width, quality }) =>
  `${src}?auto=format&fit=crop&w=${width}&q=${quality ?? 70}`;

export function SmartImage({
  src,
  alt,
  sizes,
  priority,
  className,
  fallback,
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  fallback: ReactNode;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) return <>{fallback}</>;

  const isUnsplash = src.startsWith("https://images.unsplash.com/");
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      loader={isUnsplash ? unsplashLoader : undefined}
      onError={() => setFailed(true)}
      className={cn(
        "object-cover transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.04]",
        className,
      )}
    />
  );
}
