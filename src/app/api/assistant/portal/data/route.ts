import { NextResponse } from "next/server";
import { assistantClient } from "@/lib/assistant/portal-context";
import { portalHandlers } from "@/lib/assistant/portal-tools";
import { allow } from "@/lib/assistant/rate-limit";

/** Lectures de l'assistant guidé du portail (session de la personne, RLS). */
const READS = { overview: "get_overview", menu: "get_menu", meals: "list_meals", orders: "get_orders", deliveries: "get_deliveries", invoices: "get_invoices" } as const;

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { locale?: string; establishmentId?: string; kind?: string; params?: Record<string, unknown> } | null;
  const ctx = await assistantClient(body?.establishmentId);
  if (!ctx) return NextResponse.json({ error: "auth" }, { status: 401 });
  const tool = READS[body?.kind as keyof typeof READS];
  if (!tool) return NextResponse.json({ error: "invalid" }, { status: 400 });
  if (!allow(`data:${ctx.account.user.id}`, 120, 10 * 60_000)) return NextResponse.json({ error: "rate" }, { status: 429 });
  const handlers = portalHandlers(ctx, body?.locale === "en" ? "en" : "fr", []);
  try {
    return NextResponse.json({ data: await handlers[tool](body?.params ?? {}) });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
