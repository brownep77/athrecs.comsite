import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

const server = await createServer({ appType: "custom", logLevel: "error", server: { middlewareMode: true } });
try {
  const { RacePracticalInformation } = await server.ssrLoadModule("/src/components/races/RacePracticalInformation.tsx");
  const event = { slug: "synthetic-ending-display", name: "Synthetic Race", sport: "Running", country: "United States", county: "Florida", city: "Clermont", website: "https://example.org/", organiser: "Example Club" };
  const edition = { id: 1, event_date: "2027-05-09", distance_code: "5K", distance_km: 5, status: "Open", start_time: "07:30", entry_options: [] };
  const render = (ending) => renderToStaticMarkup(createElement(RacePracticalInformation, { data: { event, upcoming: [{ ...edition, ...ending }] } }));
  const timed = render({ end_date: "2027-05-09", end_time: "10:00" });
  assert.match(timed, /Starts 07:30 EDT/);
  assert.match(timed, /Ends Sun, 9 May 2027 at 10:00 local time/);
  const dateOnly = render({ end_date: "2027-05-10", end_time: null });
  assert.match(dateOnly, /Ends Mon, 10 May 2027/);
  assert.doesNotMatch(dateOnly, /local time/);
  assert.doesNotMatch(render({ end_date: null, end_time: null }), /Ends /);
  console.log("Running schedule renders sourced endings at known precision and omits unknown endings.");
} finally {
  await server.close();
}
