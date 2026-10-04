import { NextResponse } from "next/server";
import { assistantClient } from "@/lib/assistant/portal-context";
import { executeAction, parseAction } from "@/lib/assistant/portal-execute";
import { allow } from "@/lib/assistant/rate-limit";

/** Exécute une action préparée par l'assistant, APRÈS le clic « Confirmer » de la personne. */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { locale?: string; establishmentId?: string; action?: unknown } | null;
  const ctx = await assistantClient(body?.establishmentId);
  if (!ctx) return NextResponse.json({ ok: false, error: "auth" }, { status: 401 });
  if (!allow(`exec:${ctx.account.user.id}`, 30, 10 * 60_000)) return NextResponse.json({ ok: false, error: "rate" }, { status: 429 });
  const action = parseAction(body?.action);
  if (!action) return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  return NextResponse.json(await executeAction(ctx, action, body?.locale === "en" ? "en" : "fr"));
}
