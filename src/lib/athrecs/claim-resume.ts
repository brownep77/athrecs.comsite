const MAX_AGE = 7 * 24 * 60 * 60 * 1000;

// Remember only a result ID, never an invitation token or athlete details.
// This is a navigation hint; the claim API still checks identity and ownership.
export function rememberClaim(userId: string, resultId: number | null) {
  if (typeof window === "undefined") return;
  try {
    const key = `athrecs:unfinished-claim:${userId}`;
    if (resultId === null) window.localStorage.removeItem(key);
    else if (Number.isSafeInteger(resultId) && resultId > 0)
      window.localStorage.setItem(key, JSON.stringify({ resultId, savedAt: Date.now() }));
  } catch {
    // A blocked storage preference must not prevent claiming.
  }
}

export function unfinishedClaim(userId: string): number | null {
  if (typeof window === "undefined") return null;
  try {
    const value = JSON.parse(
      window.localStorage.getItem(`athrecs:unfinished-claim:${userId}`) || "null",
    );
    if (
      Number.isSafeInteger(value?.resultId) &&
      value.resultId > 0 &&
      Number.isFinite(value.savedAt) &&
      Date.now() - value.savedAt >= 0 &&
      Date.now() - value.savedAt < MAX_AGE
    )
      return value.resultId;
  } catch {
    /* Ignore invalid or unavailable browser storage. */
  }
  return null;
}
