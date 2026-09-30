import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Client Supabase côté serveur pour les données PUBLIQUES (menu, soumissions),
 * avec la clé publique (anon / publishable) : la sécurité repose sur les
 * politiques RLS de supabase/migrations.
 *
 * Renvoie `null` si Supabase n'est pas configuré : le site continue alors
 * de fonctionner avec les données locales (src/data/menu.ts).
 *
 * Le portail client (sessions, cookies) utilisera @supabase/ssr à l'étape Auth.
 */
let client: SupabaseClient | null | undefined;

export function getPublicSupabase(): SupabaseClient | null {
  if (client !== undefined) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  client = url && key ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) : null;
  return client;
}
