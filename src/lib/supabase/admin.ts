import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabaseUrl } from "@/lib/env";

/**
 * Client « service role » : contourne la RLS. Réservé à deux usages serveur :
 *   1. inviter un utilisateur (back-office, après vérification que l'appelant est de l'équipe) ;
 *   2. le webhook Stripe (aucun utilisateur connecté).
 * Ne jamais l'importer dans un composant client.
 */
export function getAdminSupabase(): SupabaseClient | null {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !key) return null;
  return createClient(supabaseUrl, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
