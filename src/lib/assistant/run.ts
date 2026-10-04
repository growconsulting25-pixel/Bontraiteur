import "server-only";
import { createMessage, type ApiMessage, type ContentBlock, type ToolDefinition } from "./anthropic";
import type { ChatTurn } from "./types";

export type ToolHandler = (input: Record<string, unknown>) => Promise<unknown>;

/** Nettoie l'historique reçu du navigateur (rôles alternés, longueurs bornées). */
export function sanitizeHistory(raw: unknown, maxTurns = 20, maxChars = 2000): ChatTurn[] | null {
  if (!Array.isArray(raw)) return null;
  const turns: ChatTurn[] = [];
  for (const t of raw.slice(-maxTurns)) {
    if (!t || typeof t !== "object") return null;
    const { role, content } = t as Record<string, unknown>;
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") return null;
    const text = content.trim().slice(0, maxChars);
    if (!text) continue;
    // Fusionne deux messages consécutifs du même rôle (l'API exige l'alternance)
    const last = turns[turns.length - 1];
    if (last && last.role === role) last.content += `\n\n${text}`;
    else turns.push({ role, content: text });
  }
  while (turns.length && turns[0].role !== "user") turns.shift();
  if (!turns.length || turns[turns.length - 1].role !== "user") return null;
  return turns;
}

/**
 * Conversation avec outils : l'assistant peut appeler des outils (lectures,
 * propositions d'actions) jusqu'à `maxSteps` fois avant de répondre.
 */
export async function runConversation({
  system,
  history,
  tools = [],
  handlers = {},
  maxSteps = 6,
}: {
  system: string;
  history: ChatTurn[];
  tools?: ToolDefinition[];
  handlers?: Record<string, ToolHandler>;
  maxSteps?: number;
}): Promise<string> {
  const messages: ApiMessage[] = history.map((t) => ({ role: t.role, content: t.content }));
  for (let step = 0; step < maxSteps; step++) {
    const res = await createMessage({ system, messages, tools });
    const text = res.content
      .filter((b): b is Extract<ContentBlock, { type: "text" }> => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();
    const calls = res.content.filter((b): b is Extract<ContentBlock, { type: "tool_use" }> => b.type === "tool_use");
    if (res.stop_reason !== "tool_use" || calls.length === 0) return text;

    messages.push({ role: "assistant", content: res.content });
    const results: ContentBlock[] = [];
    for (const call of calls) {
      const handler = handlers[call.name];
      try {
        if (!handler) throw new Error(`unknown tool ${call.name}`);
        const out = await handler(call.input ?? {});
        results.push({ type: "tool_result", tool_use_id: call.id, content: JSON.stringify(out ?? null).slice(0, 20_000) });
      } catch (e) {
        results.push({ type: "tool_result", tool_use_id: call.id, content: `Erreur : ${(e as Error).message}`, is_error: true });
      }
    }
    messages.push({ role: "user", content: results });
  }
  return "";
}
