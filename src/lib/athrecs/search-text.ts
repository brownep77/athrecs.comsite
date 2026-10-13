const clean = (value: string) => value.replace(/\s+/g, " ").trim();

/** Keep snippets readable without changing the meaning or publishing extra records. */
export function searchSnippet(value: string, limit = 175): string {
  const text = clean(value);
  if (text.length <= limit) return text;
  return `${text
    .slice(0, limit - 1)
    .replace(/\s+\S*$/, "")
    .trimEnd()}…`;
}
