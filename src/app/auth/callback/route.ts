import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createSessionClient } from "@/lib/supabase/session";

/**
 * Retour des liens envoyés par courriel (lien magique, invitation,
 * réinitialisation). Échange le code contre une session puis redirige.
 * À déclarer dans Supabase → Authentication → URL Configuration → Redirect URLs.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const locale = searchParams.get("locale") === "en" ? "en" : "fr";
  const nextParam = searchParams.get("next") ?? "";
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : locale === "en" ? "/en/portal" : "/portail";
  const loginPath = locale === "en" ? "/en/login" : "/login";

  const supabase = await createSessionClient();
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : tokenHash && type
      ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
      : { error: new Error("missing code") };

  if (error) return NextResponse.redirect(`${origin}${loginPath}?error=link`);

  // Invitation ou réinitialisation : on envoie vers « Mon compte » pour choisir un mot de passe.
  const target = type === "invite" || type === "recovery" ? (locale === "en" ? "/en/portal/account" : "/portail/compte") : next;
  return NextResponse.redirect(`${origin}${target}`);
}
