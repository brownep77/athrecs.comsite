import { useEffect, useId, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { suggestClubs } from "@/lib/athrecs/api";

/**
 * Club search for the sign-up forms. Picking a suggestion from the AthRecs club
 * directory adds it as a new line in the clubs box; athletes can still type any
 * club (or several) straight into that box themselves.
 */
export function ClubSuggest({
  clubs,
  onChange,
  formId,
}: {
  clubs: string;
  onChange: (value: string) => void;
  formId?: string;
}) {
  const inputId = useId();
  const listId = useId();
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [active, setActive] = useState(-1);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim()), 250);
    return () => clearTimeout(timer);
  }, [query]);

  const suggestions = useQuery({
    queryKey: ["club-suggestions", debounced],
    queryFn: () => suggestClubs({ data: { q: debounced } }),
    enabled: debounced.length >= 2,
    staleTime: 5 * 60_000,
  });

  const chosen = new Set(
    clubs
      .split(/\r?\n/)
      .map((line) => line.trim().toLowerCase())
      .filter(Boolean),
  );
  const options = (suggestions.data ?? []).filter((club) => !chosen.has(club.name.toLowerCase()));
  const open = debounced.length >= 2 && query.trim().length >= 2;

  function add(name: string) {
    const lines = clubs
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    if (!lines.some((line) => line.toLowerCase() === name.toLowerCase())) lines.push(name);
    onChange(lines.slice(0, 20).join("\n"));
    setQuery("");
    setActive(-1);
  }

  return (
    <div className="space-y-1.5 text-sm font-medium text-fg">
      <label htmlFor={inputId} className="block">
        Find your club
      </label>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
        <input
          id={inputId}
          form={formId}
          type="search"
          role="combobox"
          aria-expanded={open && options.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          autoComplete="off"
          value={query}
          maxLength={80}
          placeholder="Start typing a club name"
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(-1);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown" && options.length) {
              event.preventDefault();
              setActive((index) => (index + 1) % options.length);
            } else if (event.key === "ArrowUp" && options.length) {
              event.preventDefault();
              setActive((index) => (index <= 0 ? options.length - 1 : index - 1));
            } else if (event.key === "Enter" && query.trim()) {
              // Enter adds the highlighted suggestion, or the typed name as it is.
              event.preventDefault();
              add(active >= 0 && options[active] ? options[active].name : query.trim());
            } else if (event.key === "Escape") {
              setQuery("");
            }
          }}
          className="h-11 w-full min-w-0 rounded-lg border border-border bg-bg pl-9 pr-3 text-sm text-fg outline-none focus:ring-2 focus:ring-accent/30"
        />
        {open ? (
          <ul
            id={listId}
            role="listbox"
            className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-border bg-surface py-1 shadow-card"
          >
            {options.map((club, index) => (
              <li
                key={`${club.name}-${club.city}`}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={index === active}
                className={`cursor-pointer px-3 py-2 ${index === active ? "bg-accent/10" : ""}`}
                onMouseDown={(event) => {
                  event.preventDefault();
                  add(club.name);
                }}
              >
                <span className="block text-sm text-fg">{club.name}</span>
                {club.city || club.country ? (
                  <span className="block text-xs font-normal text-muted">
                    {[club.city, club.country].filter(Boolean).join(", ")}
                  </span>
                ) : null}
              </li>
            ))}
            <li
              role="option"
              aria-selected={false}
              className="cursor-pointer border-t border-border px-3 py-2 text-sm font-normal text-accent"
              onMouseDown={(event) => {
                event.preventDefault();
                add(query.trim());
              }}
            >
              {suggestions.isFetching && !options.length
                ? "Searching…"
                : `Add “${query.trim()}” as typed`}
            </li>
          </ul>
        ) : null}
      </div>
      <p className="text-xs font-normal text-muted">
        Pick from AthRecs clubs, or type any club into the box below.
      </p>
    </div>
  );
}
