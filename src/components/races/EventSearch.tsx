import type { ReactNode } from "react";
import { FilterChips } from "@/components/races/FilterChips";
import {
  COUNTRY_GROUPS,
  PARKRUN_COUNTRY_SHORTCUTS,
  SPORTS,
  subfiltersForSport,
  upcomingMonths,
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
};

const MONTHS = upcomingMonths(14);
const fieldClass =
  "h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm text-fg outline-none focus:ring-2 focus:ring-accent/30";

export function EventSearch({
  value,
  onChange,
}: {
  value: EventSearchValues;
  onChange: (next: EventSearchValues) => void;
}) {
  const set = <K extends keyof EventSearchValues>(key: K, next: EventSearchValues[K]) => {
    const updated = { ...value, [key]: next };
    if (key === "sport") {
      updated.distance = "All";
      updated.surface = "All";
      updated.format = "All";
    }
    if (key === "month" && next) {
      updated.dateFrom = "";
      updated.dateTo = "";
    }
    onChange(updated);
  };

  const subs = subfiltersForSport(value.sport);

  return (
    <div className="space-y-4 rounded-xl border border-border bg-surface p-3.5 shadow-card">
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Search">
          <input
            value={value.q}
            onChange={(e) => set("q", e.target.value)}
            placeholder="Name, 10K, trail…"
            className={fieldClass}
          />
        </Field>
        <Field label="Postcode">
          <input
            value={value.postcode}
            onChange={(e) => set("postcode", e.target.value.toUpperCase())}
            placeholder="NR1 3PA"
            autoComplete="postal-code"
            className={fieldClass}
          />
        </Field>
        <Field label="City">
          <input
            value={value.city}
            onChange={(e) => set("city", e.target.value)}
            placeholder="Norwich"
            className={fieldClass}
          />
        </Field>
        <Field label="County">
          <input
            value={value.county}
            onChange={(e) => set("county", e.target.value)}
            placeholder="Norfolk"
            className={fieldClass}
          />
        </Field>
        <Field label="Country">
          <select
            value={value.country}
            onChange={(e) => set("country", e.target.value)}
            className={fieldClass}
          >
            <option value="All">All countries</option>
            {COUNTRY_GROUPS.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {flagForCountryFilter(opt)} {opt}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </Field>
      </div>
      <p className="-mt-1 text-xs text-subtle">
        Parkrun is in 22 countries — open Country and pick Australia, South Africa, Japan, the USA and more.
      </p>

      <FilterChips
        label={value.sport === "Parkrun" ? "Parkrun countries" : "Quick country"}
        options={[...PARKRUN_COUNTRY_SHORTCUTS]}
        value={value.country}
        onChange={(v) => set("country", v)}
        wrap
      />
      <FilterChips
        label="Sport"
        options={[...SPORTS]}
        value={value.sport}
        onChange={(v) => set("sport", v)}
      />

      {subs.map((sub) => (
        <FilterChips
          key={sub.key}
          label={sub.label}
          options={[...sub.options]}
          value={value[sub.key as SubfilterKey]}
          onChange={(v) => set(sub.key, v)}
        />
      ))}

      <div>
        <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-subtle">
          Month
        </p>
        <div className="flex max-w-full gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {MONTHS.map((m) => {
            const active = value.month === m.value;
            return (
              <button
                key={m.value || "any"}
                type="button"
                onClick={() => set("month", m.value)}
                className={`inline-flex h-10 shrink-0 items-center rounded-full border px-3.5 text-sm font-medium ${
                  active
                    ? "border-primary bg-primary text-primary-fg"
                    : "border-border bg-surface text-muted hover:border-border-strong hover:text-fg"
                }`}
              >
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="From date">
          <input
            type="date"
            value={value.dateFrom}
            onChange={(e) => onChange({ ...value, dateFrom: e.target.value, month: "" })}
            className={fieldClass}
          />
        </Field>
        <Field label="To date">
          <input
            type="date"
            value={value.dateTo}
            onChange={(e) => onChange({ ...value, dateTo: e.target.value, month: "" })}
            className={fieldClass}
          />
        </Field>
      </div>
    </div>
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
    distance: value.distance === "All" ? undefined : value.distance,
    surface: value.surface === "All" ? undefined : value.surface,
    format: value.format === "All" ? undefined : value.format,
  };
}

export function isEmptySearch(value: EventSearchValues) {
  return JSON.stringify(value) === JSON.stringify(EMPTY_SEARCH);
}
