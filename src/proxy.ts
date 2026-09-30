import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Proxy (ex-middleware) : rafraîchit la session Supabase et protège
 * le portail client et le back-office. Les pages publiques du site
 * ne passent pas ici (elles restent statiques et rapides).
 */
const PROTECTED = [/^\/portail(\/|$)/, /^\/en\/portal(\/|$)/, /^\/admin(\/|$)/];

export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const { pathname, search } = request.nextUrl;
  const loginPath = pathname.startsWith("/en/") ? "/en/login" : "/login";
  const isProtected = PROTECTED.some((re) => re.test(pathname));

  if (!url || !key) {
    // Supabase non configuré : portail inaccessible, on renvoie vers la connexion.
    return isProtected ? NextResponse.redirect(new URL(loginPath, request.url)) : NextResponse.next();
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (toSet) => {
        toSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // Important : getUser() valide le jeton auprès de Supabase Auth.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isProtected && !user) {
    const target = new URL(loginPath, request.url);
    target.searchParams.set("next", pathname + search);
    return NextResponse.redirect(target);
  }
  return response;
}

export const config = {
  matcher: ["/portail/:path*", "/en/portal/:path*", "/admin/:path*", "/login", "/en/login", "/auth/:path*"],
};
