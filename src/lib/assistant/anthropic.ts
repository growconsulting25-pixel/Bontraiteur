import "server-only";

/**
 * Appel minimal à l'API Messages d'Anthropic (sans SDK).
 * Variables : ANTHROPIC_API_KEY (obligatoire), ASSISTANT_MODEL (optionnelle),
 * ANTHROPIC_BASE_URL (optionnelle, utile pour les tests).
 */

export const isAssistantConfigured = () => Boolean(process.env.ANTHROPIC_API_KEY);
const model = () => process.env.ASSISTANT_MODEL || "claude-sonnet-5-5";
const baseUrl = () => (process.env.ANTHROPIC_BASE_URL || "https://api.anthropic.com").replace(/\/$/, "");

export type ContentBlock =
  | { type: "text"; text: string }
  | { type: "tool_use"; id: string; name: string; input: Record<string, unknown> }
  | { type: "tool_result"; tool_use_id: string; content: string; is_error?: boolean };

export interface ApiMessage {
  role: "user" | "assistant";
  content: string | ContentBlock[];
}

export interface ToolDefinition {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
}

interface ApiResponse {
  content: ContentBlock[];
  stop_reason: "end_turn" | "tool_use" | "max_tokens" | "stop_sequence" | string;
}

export async function createMessage({
  system,
  messages,
  tools,
  maxTokens = 1024,
}: {
  system: string;
  messages: ApiMessage[];
  tools?: ToolDefinition[];
  maxTokens?: number;
}): Promise<ApiResponse> {
  const res = await fetch(`${baseUrl()}/v1/messages`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: model(),
      max_tokens: maxTokens,
      // La partie fixe (instructions + connaissances) est mise en cache pour réduire les coûts.
      system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
      messages,
      ...(tools?.length ? { tools } : {}),
    }),
    signal: AbortSignal.timeout(45_000),
  });
  if (!res.ok) throw new Error(`anthropic ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return (await res.json()) as ApiResponse;
}
