import { assistantInstructions, type AssistantLanguage, type ChatMessage } from "./assistant.ts";

export class AssistantProviderError extends Error {
  readonly code: string;
  constructor(status: number, code?: string) {
    super("Assistant provider unavailable");
    const known = [
      "insufficient_funds",
      "customer_verification_required",
      "quota_for_entity_exceeded",
      "insufficient_quota",
      "model_not_found",
      "invalid_api_key",
    ];
    this.code = code && known.includes(code) ? code : `http_${status}`;
  }
}

export async function askOpenAI(
  messages: ChatMessage[],
  language: AssistantLanguage,
  config: { apiKey: string; model: string; provider?: "openai" | "vercel" },
  fetcher: typeof fetch = fetch,
): Promise<string> {
  const endpoint =
    config.provider === "vercel"
      ? "https://ai-gateway.vercel.sh/v1/responses"
      : "https://api.openai.com/v1/responses";
  const response = await fetcher(endpoint, {
    method: "POST",
    headers: { Authorization: `Bearer ${config.apiKey}`, "Content-Type": "application/json" },
    signal: AbortSignal.timeout(25000),
    body: JSON.stringify({
      model: config.model,
      store: false,
      instructions: assistantInstructions(language),
      input: messages
        .filter((message) => message.status === "complete")
        .slice(-10)
        .map(({ role, content }) => ({ type: "message", role, content: content.slice(0, 1800) })),
      max_output_tokens: 600,
      reasoning: { effort: "low" },
    }),
  });
  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as {
      error?: { code?: string; type?: string };
    } | null;
    throw new AssistantProviderError(response.status, error?.error?.code || error?.error?.type);
  }
  const data = (await response.json()) as {
    status?: string;
    output?: { type: string; content?: { type: string; text?: string }[] }[];
  };
  if (data.status !== "completed" || !Array.isArray(data.output))
    throw new Error("Incomplete response");
  const text = data.output
    .filter((item) => item.type === "message")
    .flatMap((item) => item.content ?? [])
    .filter((item) => item.type === "output_text")
    .map((item) => item.text ?? "")
    .join("\n")
    .trim();
  if (!text || text.length > 4000) throw new Error("Empty or oversized response");
  return text;
}
