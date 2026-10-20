/** Conversation references never become redirects or authentication credentials. */
export function assistantConversationId(value: unknown): string | undefined {
  return typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
    ? value
    : undefined;
}

export function assistantInboxPath(value: unknown) {
  const id = assistantConversationId(value);
  return `/admin/assistant-chats${id ? `?chat=${id}` : ""}`;
}
