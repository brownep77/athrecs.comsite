import { useCallback, useEffect, useSyncExternalStore } from "react";
import type { SportFixture } from "@/lib/athrecs/sport-fixtures.server";

export type SavedFixture = {
  key: string;
  eventId: number;
  slug: string;
  name: string;
  eventDate: string;
  country: string | null;
  distances: string[];
};

const STORAGE_KEY = "athrecs.saved-fixtures.v1";
const MAX_SAVED_FIXTURES = 200;
type Snapshot = {
  savedFixtures: SavedFixture[];
  ready: boolean;
  persistenceAvailable: boolean;
};
const serverSnapshot: Snapshot = {
  savedFixtures: [],
  ready: false,
  persistenceAvailable: true,
};
let snapshot = serverSnapshot;
let hasMemoryOnlyChanges = false;
const listeners = new Set<() => void>();

export function savedFixtureKey(fixture: Pick<SportFixture, "eventId" | "eventDate">): string {
  return `${fixture.eventId}:${fixture.eventDate}`;
}

function validDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

/** Storage is untrusted: retain only public fields and rebuild the identity and link. */
export function parseSavedFixtures(raw: string | null): SavedFixture[] {
  if (!raw || raw.length > 512_000) return [];
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!data || typeof data !== "object" || !("version" in data) || data.version !== 1) return [];
  if (!("fixtures" in data) || !Array.isArray(data.fixtures)) return [];
  const seen = new Set<string>();
  const fixtures: SavedFixture[] = [];
  for (const value of data.fixtures) {
    if (!value || typeof value !== "object") continue;
    const item = value as Record<string, unknown>;
    if (
      typeof item.eventId !== "number" ||
      !Number.isSafeInteger(item.eventId) ||
      item.eventId < 1 ||
      typeof item.slug !== "string" ||
      !item.slug.trim() ||
      item.slug.length > 300 ||
      /[/\\?#\s]/.test(item.slug) ||
      typeof item.name !== "string" ||
      !item.name.trim() ||
      item.name.length > 500 ||
      !validDate(item.eventDate)
    )
      continue;
    const key = savedFixtureKey({ eventId: item.eventId, eventDate: item.eventDate });
    if (seen.has(key)) continue;
    seen.add(key);
    fixtures.push({
      key,
      eventId: item.eventId,
      slug: item.slug,
      name: item.name,
      eventDate: item.eventDate,
      country: typeof item.country === "string" ? item.country.slice(0, 120) : null,
      distances: Array.isArray(item.distances)
        ? [
            ...new Set(
              item.distances.filter(
                (value): value is string =>
                  typeof value === "string" && value.length > 0 && value.length <= 100,
              ),
            ),
          ].slice(0, 30)
        : [],
    });
    if (fixtures.length === MAX_SAVED_FIXTURES) break;
  }
  return fixtures;
}

function publish(next: Snapshot) {
  snapshot = next;
  for (const listener of listeners) listener();
}

function refresh() {
  if (typeof window === "undefined") return;
  if (hasMemoryOnlyChanges) return;
  try {
    const savedFixtures = parseSavedFixtures(window.localStorage.getItem(STORAGE_KEY));
    publish({ savedFixtures, ready: true, persistenceAvailable: true });
  } catch {
    publish({ ...snapshot, ready: true, persistenceAvailable: false });
  }
}

function onStorage(event: StorageEvent) {
  if (event.key === STORAGE_KEY || event.key === null) refresh();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1 && typeof window !== "undefined")
    window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && typeof window !== "undefined")
      window.removeEventListener("storage", onStorage);
  };
}

function write(savedFixtures: SavedFixture[]) {
  if (typeof window === "undefined") return;
  let persistenceAvailable = true;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 1, fixtures: savedFixtures }),
    );
  } catch {
    // Keep the shortlist usable in this tab when storage is disabled or full.
    persistenceAvailable = false;
  }
  hasMemoryOnlyChanges = !persistenceAvailable;
  publish({ savedFixtures, ready: true, persistenceAvailable });
}

/** An anonymous, device-local shortlist; never writes to profiles or calendar subscriptions. */
export function useSavedFixtures() {
  const state = useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => serverSnapshot,
  );
  useEffect(() => {
    // Refresh on mounting so changes made in another tab while unmounted are picked up.
    refresh();
  }, []);

  const isSaved = useCallback(
    (fixture: Pick<SportFixture, "eventId" | "eventDate">) =>
      state.savedFixtures.some((saved) => saved.key === savedFixtureKey(fixture)),
    [state.savedFixtures],
  );
  const toggleSaved = useCallback((fixture: SportFixture) => {
    if (typeof window === "undefined" || !fixture.slug) return;
    if (!snapshot.ready) refresh();
    const key = savedFixtureKey(fixture);
    if (snapshot.savedFixtures.some((saved) => saved.key === key)) {
      write(snapshot.savedFixtures.filter((saved) => saved.key !== key));
      return;
    }
    const candidate = parseSavedFixtures(
      JSON.stringify({
        version: 1,
        fixtures: [
          {
            key,
            eventId: fixture.eventId,
            slug: fixture.slug,
            name: fixture.name,
            eventDate: fixture.eventDate,
            country: fixture.country,
            distances: fixture.starts.map((start) => start.distance),
          },
        ],
      }),
    )[0];
    if (candidate) write([candidate, ...snapshot.savedFixtures].slice(0, MAX_SAVED_FIXTURES));
  }, []);
  const removeSaved = useCallback((key: string) => {
    if (!snapshot.ready) refresh();
    write(snapshot.savedFixtures.filter((saved) => saved.key !== key));
  }, []);

  return { ...state, isSaved, toggleSaved, removeSaved };
}
