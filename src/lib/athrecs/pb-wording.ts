/** Apply site wording to displayed prose without rewriting stored athlete text. */
export function pbWording(value: string): string {
  return value.replace(/\bpersonal(?:\s+|[-‐‑])best(s?)\b/gi, (_, plural: string) =>
    plural ? "PBs" : "PB",
  );
}
