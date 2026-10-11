import { anzSource } from "./core.ts";
import { parseAnzProfile, parseAnzEvent, assembleAnzCapture } from "./parse.server.ts";
/** Only ANZ's public, same-origin athlete form; no arbitrary URLs or authenticated sources. */
export async function fetchAnzCapture(
  value: string,
  saveHtml?: (name: string, html: string) => Promise<void>,
) {
  const source = anzSource(value),
    cookies = new Map<string, string>();
  const deadline = AbortSignal.timeout(240_000);
  async function request(url: string, body?: URLSearchParams) {
    const response = await fetch(url, {
      method: body ? "POST" : "GET",
      body,
      redirect: "error",
      headers: {
        ...(cookies.size ? { Cookie: [...cookies].map(([k, v]) => `${k}=${v}`).join("; ") } : {}),
        ...(body ? { Referer: source.url } : {}),
      },
      signal: AbortSignal.any([deadline, AbortSignal.timeout(40_000)]),
    });
    if (!response.ok)
      throw new Error(`ANZ returned HTTP ${response.status}. No results have been changed.`);
    for (const cookie of response.headers.getSetCookie()) {
      const pair = cookie.split(";", 1)[0],
        i = pair.indexOf("=");
      if (i > 0) cookies.set(pair.slice(0, i), pair.slice(i + 1));
    }
    const reader = response.body?.getReader();
    if (!reader) throw new Error("Empty ANZ response.");
    let html = "",
      bytes = 0;
    const decoder = new TextDecoder();
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        bytes += value.length;
        if (bytes > 4_000_000) throw new Error("ANZ response too large for automatic import.");
        html += decoder.decode(value, { stream: true });
      }
      html += decoder.decode();
    } finally {
      await reader.cancel();
    }
    return html;
  }
  const html = await request(source.url);
  await saveHtml?.("profile.html", html);
  const profile = parseAnzProfile(html, source.url);
  let token = profile.token;
  const batches = [];
  for (const event of profile.events) {
    const page = await request(
      `https://www.anzrankings.org.nz/site/profiles_con/athlete_data/${source.externalId}`,
      new URLSearchParams({
        csrf_token: token,
        athleteID: source.externalId,
        eventID: event.id,
        year: "0",
        order_by: "1",
      }),
    );
    await saveHtml?.(`event-${event.id}.html`, page);
    batches.push(parseAnzEvent(page, profile, event));
    token = parseAnzProfile(page, source.url).token;
  }
  return assembleAnzCapture(profile, batches);
}
