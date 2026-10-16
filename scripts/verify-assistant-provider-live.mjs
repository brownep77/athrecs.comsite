// Opt-in, two synthetic requests in the actual deployment environment.
// No credentials, provider error bodies or visitor records are logged.
import { assistantProviderConfig } from "../src/lib/athrecs/assistant-config.server.ts";
import { askOpenAI, AssistantProviderError } from "../src/lib/athrecs/assistant-provider.server.ts";

if (process.env.ATHRECS_ASSISTANT_VERIFY_PROVIDER === "true") {
  const config = assistantProviderConfig();
  if (!config.apiKey) {
    console.error("Assistant live verification: missing provider credential.");
    process.exit(1);
  }
  try {
    for (const [language, content] of [
      ["en", "Where do I create my athlete account?"],
      ["fr", "Où puis-je créer mon compte sportif ?"],
    ]) {
      const reply = await askOpenAI(
        [
          {
            role: "user",
            content,
            language,
            status: "complete",
            created_at: new Date().toISOString(),
          },
        ],
        language,
        config,
      );
      console.log(
        `Assistant live verification (${config.provider}; ${config.model}; ${language}): ${reply}`,
      );
    }
  } catch (error) {
    console.error(
      `Assistant live verification failed: ${error instanceof AssistantProviderError ? error.code : "incomplete_or_unavailable_response"}`,
    );
    process.exit(1);
  }
}
