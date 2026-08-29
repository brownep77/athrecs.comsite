import type { ReactNode } from "react";
import { FilterChips } from "@/components/races/FilterChips";
import {
  COUNTRY_GROUPS,
  SPORTS,
  subfilterKeysForSport,
  subfiltersForSport,
  supportsRaceGroupFilter,
  upcomingMonths,
  type SubfilterDef,
  type SubfilterKey,
} from "@/lib/athrecs/filters";
import { flagForCountryFilter } from "@/lib/athrecs/countries";

export type EventSearchValues = {
  q: string;
  sport: string;
  country: string;
  county: string;
  city: string;
  postcode: string;
  month: string;
  dateFrom: string;
  dateTo: string;
  distance: string;
  surface: string;
  format: string;
  group: string;
};

export const EMPTY_SEARCH: EventSearchValues = {
  q: "",
  sport: "All",
  country: "All",
  county: "",
  city: "",
  postcode: "",
  month: "",
  dateFrom: "",
  dateTo: "",
  distance: "All",
  surface: "All",
  format: "All",
  group: "All",
};

const MONTHS = upcomingMonths(17);
const fieldClass =
  "h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm text-fg outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25";
const sectionClass = "space-y-3 border-t border-border pt-4 first:border-t-0 first:pt-0";

export function EventSearch({
  value,
  onChange,
  variant = "sidebar",
  fixedCountry,
  fixedCountryLabel,
  onDone,
}: {
  value: EventSearchValues;
  onChange: (next: EventSearchValues) => void;
  /** sidebar = vertical stack for left column; panel = wider grid */
  variant?: "sidebar" | "panel";
  /** Locks the search to a country on country-specific calendar pages. */
  fixedCountry?: string;
  fixedCountryLabel?: string;
  /** Mobile-only action used to close the filter panel and return to results. */
  onDone?: () => void;
}) {
  const set = <K extends keyof EventSearchValues>(key: K, next: EventSearchValues[K]) => {
    const updated = { ...value, [key]: next };
    if (key === "sport") {
      updated.distance = "All";
      updated.surface = "All";
      updated.format = "All";
      updated.group = "All";
    }
    if (key === "country") {
      updated.county = "";
      updated.city = "";
      updated.postcode = "";
    }
    if (key === "month" && next) {
      updated.dateFrom = "";
      updated.dateTo = "";
    }
    onChange(updated);
  };

  const subs = subfiltersForSport(value.sport);
  const showRaceGroups = supportsRaceGroupFilter(value.sport);
  const clear = () =>
    onChange({
      ...EMPTY_SEARCH,
      country: fixedCountry ?? "All",
    });
  const activeFilterCount = countActiveSearchFilters(value, {
    ignoreCountry: Boolean(fixedCountry),
  });
  const hasFilters = activeFilterCount > 0;
  const gridClass = variant === "sidebar" ? "grid gap-3" : "grid gap-3 md:grid-cols-2";

  return (
    <aside
      className="space-y-4 rounded-xl border border-border bg-surface p-4 shadow-card"
      aria-label="Search events"
    >
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="font-display text-base font-semibold text-fg">Find events</p>
          <p className="mt-0.5 text-xs text-subtle">Filters update the results and page address.</p>
        </div>
        {hasFilters ? (
          <button
            type="button"
            onClick={clear}
            className="min-h-10 rounded-lg px-2 text-xs font-medium text-accent hover:bg-elevated hover:underline"
          >
            Clear all
          </button>
        ) : null}
      </div>

      <section className={sectionClass} aria-labelledby="discipline-filter-heading">
        <SectionHeading id="discipline-filter-heading" eyebrow="1" title="Discipline" />
        <Field label="Choose a discipline">
          <select
            value={value.sport}
            onChange={(event) => set("sport", event.target.value)}
            className={fieldClass}
          >
            {SPORTS.map((sport) => (
              <option key={sport} value={sport}>
                {sport === "All" ? "All disciplines" : sport}
              </option>
            ))}
          </select>
        </Field>

        {value.sport === "All" ? (
          <p className="rounded-lg border border-dashed border-border bg-elevated px-3 py-2.5 text-xs leading-relaxed text-muted">
            Choose one discipline to reveal only its relevant surface, distance or format filters.
          </p>
        ) : subs.length ? (
          <div className="space-y-3 rounded-lg border border-border bg-elevated p-3">
            <p className="text-xs font-medium text-fg">{value.sport} filters</p>
            <div className={gridClass}>
              {subs.map((sub) => (
                <DisciplineFilter
                  key={sub.key}
                  filter={sub}
                  value={value[sub.key as SubfilterKey]}
                  onChange={(next) => set(sub.key, next)}
                />
              ))}
            </div>
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-border bg-elevated px-3 py-2.5 text-xs leading-relaxed text-muted">
            There are no extra {value.sport.toLowerCase()} controls to show. Narrow the results by
            location, date or event name below.
          </p>
        )}

        {showRaceGroups ? (
          <Field label="Running series or qualification">
            <select
              value={value.group}
              onChange={(event) => set("group", event.target.value)}
              className={fieldClass}
            >
              <option value="All">All running events</option>
              <option value="world-marathon-majors">World Marathon Majors</option>
              <option value="utmb-world-series">UTMB World Series</option>
              <option value="utmb-index">UTMB Index races</option>
            </select>
          </Field>
        ) : null}
      </section>

      <section className={sectionClass} aria-labelledby="location-filter-heading">
        <SectionHeading id="location-filter-heading" eyebrow="2" title="Location" />

        {fixedCountry ? (
          <div className="rounded-lg border border-border bg-elevated px-3 py-2.5">
            <p className="text-[11px] font-medium uppercase tracking-wider text-subtle">Country</p>
            <p className="mt-1 text-sm font-medium text-fg">
              {flagForCountryFilter(fixedCountry)} {fixedCountryLabel ?? fixedCountry}
            </p>
          </div>
        ) : (
          <Field label="Country">
            <select
              value={value.country}
              onChange={(event) => set("country", event.target.value)}
              autoComplete="country-name"
              className={fieldClass}
            >
              <option value="All">All countries</option>
              {COUNTRY_GROUPS.map((group) => (
                <optgroup key={group.label} label={group.label}>
                  {group.options.map((option) => (
                    <option key={option} value={option}>
                      {flagForCountryFilter(option)} {option}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </Field>
        )}

        <div className={gridClass}>
          <Field label="Region / county / state">
            <input
              value={value.county}
              onChange={(event) => set("county", event.target.value)}
              placeholder="Norfolk, Bavaria, California…"
              autoComplete="address-level1"
              className={fieldClass}
            />
          </Field>
          <Field label="City / town">
            <input
              value={value.city}
              onChange={(event) => set("city", event.target.value)}
              placeholder="Norwich"
              autoComplete="address-level2"
              className={fieldClass}
            />
          </Field>
          <Field label="Postcode / ZIP (optional)">
            <input
              value={value.postcode}
              onChange={(event) => set("postcode", event.target.value.toUpperCase())}
              placeholder="NR1 3PA"
              autoComplete="postal-code"
              className={fieldClass}
            />
          </Field>
        </div>
      </section>

      <section className={sectionClass} aria-labelledby="date-filter-heading">
        <SectionHeading id="date-filter-heading" eyebrow="3" title="Date" />
        <Field label="Month">
          <select
            value={value.month}
            onChange={(event) => set("month", event.target.value)}
            className={fieldClass}
          >
            {MONTHS.map((month) => (
              <option key={month.value || "any"} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
        </Field>

        <details
          className="rounded-lg border border-border bg-elevated px-3 py-2.5"
          open={Boolean(value.dateFrom || value.dateTo) || undefined}
        >
          <summary className="cursor-pointer text-sm font-medium text-fg">Choose exact dates</summary>
          <div className={`${gridClass} mt-3`}>
            <Field label="From date">
              <input
                type="date"
                value={value.dateFrom}
                onChange={(event) =>
                  onChange({ ...value, dateFrom: event.target.value, month: "" })
                }
                className={fieldClass}
              />
            </Field>
            <Field label="To date">
              <input
                type="date"
                value={value.dateTo}
                onChange={(event) => onChange({ ...value, dateTo: event.target.value, month: "" })}
                className={fieldClass}
              />
            </Field>
          </div>
        </details>
      </section>

      <section className={sectionClass} aria-labelledby="keyword-filter-heading">
        <SectionHeading id="keyword-filter-heading" eyebrow="4" title="Event name" />
        <Field label="Name or keyword">
          <input
            value={value.q}
            onChange={(event) => set("q", event.target.value)}
            placeholder="London, night race, championship…"
            className={fieldClass}
          />
        </Field>
      </section>

      <div className="border-t border-border pt-4">
        <p className="text-[11px] leading-relaxed text-subtle">
          {value.sport === "All"
            ? "Select a discipline for a cleaner, tailored search."
            : `Only filters relevant to ${value.sport.toLowerCase()} are applied.`}
        </p>
        {onDone ? (
          <button
            type="button"
            onClick={onDone}
            className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-fg lg:hidden"
          >
            View results{activeFilterCount ? ` (${activeFilterCount} filters)` : ""}
          </button>
        ) : null}
      </div>
    </aside>
  );
}

function SectionHeading({ id, eyebrow, title }: { id: string; eyebrow: string; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        aria-hidden="true"
        className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-fg"
      >
        {eyebrow}
      </span>
      <h2 id={id} className="font-display text-sm font-semibold text-fg">
        {title}
      </h2>
    </div>
  );
}

function DisciplineFilter({
  filter,
  value,
  onChange,
}: {
  filter: SubfilterDef;
  value: string;
  onChange: (next: string) => void;
}) {
  if (filter.options.length <= 7) {
    return (
      <FilterChips
        label={filter.label}
        options={filter.options}
        value={value}
        onChange={onChange}
        wrap
      />
    );
  }

  return (
    <Field label={filter.label}>
      <select value={value} onChange={(event) => onChange(event.target.value)} className={fieldClass}>
        {filter.options.map((option) => (
          <option key={option} value={option}>
            {option === "All" ? `Any ${filter.label.toLowerCase()}` : option}
          </option>
        ))}
      </select>
    </Field>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5 text-xs font-medium text-muted">
      {label}
      {children}
    </label>
  );
}

export function searchToApi(value: EventSearchValues) {
  const supported = subfilterKeysForSport(value.sport);
  return {
    q: value.q || undefined,
    sport: value.sport === "All" ? undefined : value.sport,
    country: value.country === "All" ? undefined : value.country,
    county: value.county || undefined,
    city: value.city || undefined,
    postcode: value.postcode || undefined,
    month: value.month || undefined,
    dateFrom: value.dateFrom || undefined,
    dateTo: value.dateTo || undefined,
    distance:
      supported.has("distance") && value.distance !== "All" ? value.distance : undefined,
    surface: supported.has("surface") && value.surface !== "All" ? value.surface : undefined,
    format: supported.has("format") && value.format !== "All" ? value.format : undefined,
    group:
      supportsRaceGroupFilter(value.sport) && value.group !== "All" ? value.group : undefined,
  };
}

export function countActiveSearchFilters(
  value: EventSearchValues,
  options: { ignoreCountry?: boolean } = {},
): number {
  const api = searchToApi(value);
  return Object.entries(api).filter(
    ([key, filterValue]) => filterValue !== undefined && !(options.ignoreCountry && key === "country"),
  ).length;
}

export function isEmptySearch(value: EventSearchValues) {
  return countActiveSearchFilters(value) === 0;
}
