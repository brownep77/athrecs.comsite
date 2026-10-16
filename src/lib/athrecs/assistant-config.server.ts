// Read credentials per request: Vercel refreshes its short-lived OIDC token.
export function assistantProviderConfig(env: NodeJS.ProcessEnv = process.env) {
  const provider = env.ATHRECS_ASSISTANT_PROVIDER === "vercel" ? "vercel" : "openai";
  return {
    provider,
    apiKey:
      provider === "vercel"
        ? env.AI_GATEWAY_API_KEY?.trim() || env.VERCEL_OIDC_TOKEN?.trim() || ""
        : env.OPENAI_API_KEY?.trim() || "",
    model:
      env.OPENAI_ASSISTANT_MODEL?.trim() ||
      (provider === "vercel" ? "openai/gpt-6-luna" : "gpt-6-luna"),
    // Rotating OIDC tokens must not change network rate-limit identities.
    rateLimitSecret:
      env.ATHRECS_ASSISTANT_RATE_LIMIT_SECRET?.trim() || env.OPENAI_API_KEY?.trim() || "",
  } as const;
}
