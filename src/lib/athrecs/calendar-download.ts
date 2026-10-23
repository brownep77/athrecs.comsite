import {
  buildCalendarEvent,
  calendarFilename,
  calendarIcs,
  type CalendarRace,
} from "./event-calendar.ts";

const limits = {
  id: 1000,
  name: 1000,
  date: 10,
  distance: 500,
  startTime: 30,
  startLabel: 1000,
  endDate: 10,
  endTime: 30,
  timeZone: 100,
  location: 2000,
  pageUrl: 2000,
  officialUrl: 2000,
  entryUrl: 2000,
  status: 100,
} as const;
const required = ["id", "name", "date", "pageUrl"] as const;
const headers = {
  "Cache-Control": "private, no-store",
  "X-Robots-Tag": "noindex, nofollow",
  "X-Content-Type-Options": "nosniff",
};

/** A regular browser form download: no account, client JavaScript or database read. */
export async function calendarDownloadResponse(request: Request): Promise<Response> {
  const fail = (message: string, status = 400) =>
    new Response(message, {
      status,
      headers: { ...headers, "Content-Type": "text/plain; charset=utf-8" },
    });
  if (request.method !== "POST")
    return fail("Use the calendar download button on the event page.", 405);
  if (!request.headers.get("content-type")?.startsWith("application/x-www-form-urlencoded"))
    return fail("Invalid calendar download request.", 415);
  // Bound both declared and streamed bodies on this anonymous, read-only endpoint.
  if (Number(request.headers.get("content-length")) > 65536)
    return fail("Calendar details are too long.", 413);
  const reader = request.body?.getReader();
  if (!reader) return fail("Calendar details are missing.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 65536) {
        await reader.cancel();
        return fail("Calendar details are too long.", 413);
      }
      chunks.push(value);
    }
    const body = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      body.set(chunk, offset);
      offset += chunk.length;
    }
    const form = new URLSearchParams(new TextDecoder().decode(body));
    if (form.getAll("race").length !== 1)
      return fail("Calendar details are missing or duplicated.");
    const input: unknown = JSON.parse(form.get("race")!);
    if (!input || typeof input !== "object" || Array.isArray(input))
      return fail("Invalid calendar details.");
    const data = input as Record<string, unknown>;
    if (required.some((key) => typeof data[key] !== "string" || !data[key]))
      return fail("Incomplete calendar details.");
    if (data.provisional !== undefined && typeof data.provisional !== "boolean")
      return fail("Invalid provisional date.");
    const race: Record<string, unknown> = { provisional: data.provisional };
    for (const [key, limit] of Object.entries(limits)) {
      const value = data[key];
      if (
        value !== undefined &&
        value !== null &&
        (typeof value !== "string" || value.length > limit)
      )
        return fail("Invalid calendar details.");
      race[key] = value;
    }
    const event = buildCalendarEvent(race as CalendarRace);
    if (!event) return fail("This event does not have a valid, available calendar date.", 422);
    return new Response(calendarIcs(event), {
      headers: {
        ...headers,
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="${calendarFilename(event)}"`,
      },
    });
  } catch {
    return fail("Unable to read these calendar details. Return to the event page and try again.");
  } finally {
    reader.releaseLock();
  }
}
