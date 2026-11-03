import { isResultDocument } from "./result-document.ts";

export function publicFixtureUrl(value: string | undefined | null): string | null {
  return value && !isResultDocument(value) ? value : null;
}

/** Public fixture notes sometimes contain embedded result URLs. */
export function fixtureReferenceText(text: string): string {
  return text
    .replace(/https?:\/\/[^\s<>"'`;,]+/gi, (token) => {
      const url = token.replace(/[).]+$/, "");
      if (!isResultDocument(url)) return token;
      return token.slice(url.length);
    })
    .trim();
}

/** Keep the reviewed clock, status and public qualifications on a browser copy. */
export function publicFixtureJson(json: string): string {
  return JSON.stringify(
    JSON.parse(json, (_key, value) =>
      typeof value === "string" && /https?:\/\//i.test(value) ? fixtureReferenceText(value) : value,
    ),
  );
}
