import { useState } from "react";
import type { getEventBySlug } from "@/lib/athrecs/api";
import { formatRaceDateShort } from "@/lib/athrecs/format";
import { EntryOptions } from "./EntryOptions";

export function RaceEntryOptions({
  data,
}: {
  data: NonNullable<Awaited<ReturnType<typeof getEventBySlug>>>;
}) {
  const [selectedKey, setSelectedKey] = useState("");
  const editions = data.upcoming;
  const selected =
    editions.find((edition) => `${edition.id}-${edition.event_date}` === selectedKey) ??
    editions[0];
  if (data.event.sport === "Parkrun") return null;
  return (
    <div className="space-y-3">
      {editions.length > 1 ? (
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="entry-edition" className="text-sm font-semibold">
            Entry options for
          </label>
          <select
            id="entry-edition"
            value={selected ? `${selected.id}-${selected.event_date}` : ""}
            onChange={(event) => setSelectedKey(event.target.value)}
            className="min-h-11 max-w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg"
          >
            {editions.map((edition) => (
              <option
                key={`${edition.id}-${edition.event_date}`}
                value={`${edition.id}-${edition.event_date}`}
              >
                {edition.distance_code} · {formatRaceDateShort(edition.event_date)}
              </option>
            ))}
          </select>
        </div>
      ) : null}
      <EntryOptions
        options={selected?.entry_options ?? []}
        editionDate={selected?.event_date}
        officialWebsite={data.event.website}
      />
    </div>
  );
}
