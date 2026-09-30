/** Configuration lue depuis les variables d'environnement (voir .env.example). */

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

/** URL publique du site (liens de connexion, retours Stripe). */
export function siteUrl() {
  const url =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.URL ?? // fourni automatiquement par Netlify
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  return url.replace(/\/$/, "");
}
