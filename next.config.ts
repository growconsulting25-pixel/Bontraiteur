import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    // Ajouter ici le domaine Supabase Storage lorsque les photos y seront hébergées.
    remotePatterns: [],
  },
};

export default nextConfig;
