import { assistantInstructions, type AssistantLanguage, type ChatMessage } from "./assistant.ts";

export async function askOpenAI(
  messages: ChatMessage[],
  language: AssistantLanguage,
  config: { apiKey: string; model: string },
  fetcher: typeof fetch = fetch,
): Promise<string> {
  const response = await fetcher("https://api.openai.com/v1/responses", {
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
        .map(({ role, content }) => ({ role, content: content.slice(0, 1800) })),
      max_output_tokens: 600,
      reasoning: { effort: "low" },
    }),
  });
  if (!response.ok) throw new Error("Assistant provider unavailable");
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
