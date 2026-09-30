"use server";

import { redirect } from "next/navigation";
import { createSessionClient } from "@/lib/supabase/session";
import { isSupabaseConfigured, siteUrl } from "@/lib/env";
import { href, type Locale } from "@/i18n";
import { portalHref } from "@/i18n/portal-routes";

export type AuthState = { status: "idle" | "error" | "sent"; message?: "invalid" | "generic" | "notConfigured" };

/** N'autorise que des redirections internes (évite les redirections ouvertes). */
function safeNext(next: FormDataEntryValue | null, fallback: string) {
  const value = typeof next === "string" ? next : "";
  return value.startsWith("/") && !value.startsWith("//") ? value : fallback;
}

export async function signInWithPassword(_: AuthState, formData: FormData): Promise<AuthState> {
  const locale = (formData.get("locale") === "en" ? "en" : "fr") as Locale;
  if (!isSupabaseConfigured) return { status: "error", message: "notConfigured" };

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { status: "error", message: "invalid" };

  const supabase = await createSessionClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return { status: "error", message: "invalid" };

  // Membre de l'équipe sans organisation cliente → back-office
  const [{ data: staff }, { count }] = await Promise.all([
    supabase.from("staff_members").select("user_id").eq("user_id", data.user.id).maybeSingle(),
    supabase.from("memberships").select("organization_id", { count: "exact", head: true }).eq("user_id", data.user.id),
  ]);
  const fallback = staff && !count ? "/admin" : portalHref("home", locale);
  redirect(safeNext(formData.get("next"), fallback));
}

export async function sendMagicLink(_: AuthState, formData: FormData): Promise<AuthState> {
  const locale = (formData.get("locale") === "en" ? "en" : "fr") as Locale;
  if (!isSupabaseConfigured) return { status: "error", message: "notConfigured" };

  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { status: "error", message: "invalid" };

  const next = safeNext(formData.get("next"), portalHref("home", locale));
  const supabase = await createSessionClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      // Les comptes sont créés par Bon Traiteur : pas d'inscription libre.
      shouldCreateUser: false,
      emailRedirectTo: `${siteUrl()}/auth/callback?next=${encodeURIComponent(next)}&locale=${locale}`,
    },
  });
  // Même réponse que le compte existe ou non (ne pas révéler les courriels clients).
  if (error && !/signups not allowed|user not found/i.test(error.message)) {
    console.error("[auth] Lien magique :", error.message);
  }
  return { status: "sent" };
}

export async function signOut(formData: FormData) {
  const locale = (formData.get("locale") === "en" ? "en" : "fr") as Locale;
  if (isSupabaseConfigured) {
    const supabase = await createSessionClient();
    await supabase.auth.signOut();
  }
  redirect(href("login", locale));
}

export type PasswordState = { status: "idle" | "saved" | "error" };

export async function updatePassword(_: PasswordState, formData: FormData): Promise<PasswordState> {
  const password = String(formData.get("password") ?? "");
  if (password.length < 8) return { status: "error" };
  const supabase = await createSessionClient();
  const { error } = await supabase.auth.updateUser({ password });
  return error ? { status: "error" } : { status: "saved" };
}
