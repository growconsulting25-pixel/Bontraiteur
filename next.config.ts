import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    // Photos d'illustration temporaires (redimensionnées par le CDN Unsplash via un loader).
    // Ajouter ici le domaine Supabase Storage lorsque les vraies photos y seront hébergées.
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
  experimental: {
    // Téléversement de documents et de factures PDF depuis le back-office (10 Mo max)
    serverActions: { bodySizeLimit: "10mb" },
    // Le site a deux mises en page racines (FR et EN) : la 404 globale est définie dans app/global-not-found.tsx
    globalNotFound: true,
  },
};

export default nextConfig;
