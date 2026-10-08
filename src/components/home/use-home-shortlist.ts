import { useEffect, useState } from "react";

export type ShortlistItem = {
  key: string;
  kind: "athlete" | "event" | "club";
  name: string;
  href: string;
};
export const SHORTLIST_KEY = "athrecs.home.shortlist.v1";

export function parseShortlist(raw: string | null): ShortlistItem[] {
  try {
    const items: unknown = JSON.parse(raw ?? "[]");
    if (!Array.isArray(items)) return [];
    return items
      .filter(
        (item): item is ShortlistItem =>
          item &&
          typeof item === "object" &&
          ["athlete", "event", "club"].includes(item.kind) &&
          typeof item.key === "string" &&
          item.key.length <= 150 &&
          typeof item.name === "string" &&
          item.name.length <= 300 &&
          typeof item.href === "string" &&
          item.href.length <= 2000 &&
          (/^\/(?!\/)/.test(item.href) || /^https?:\/\//.test(item.href)),
      )
      .slice(0, 100);
  } catch {
    return [];
  }
}

/** A device-local shortlist, explicitly labelled in the UI; no account-sync or
 * notifications are implied. Read after hydration and report storage failures.
 */
export function useHomeShortlist() {
  const [items, setItems] = useState<ShortlistItem[]>([]);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    try {
      setItems(parseShortlist(localStorage.getItem(SHORTLIST_KEY)));
    } catch {
      setMessage("Your browser is blocking saved items.");
    }
    setReady(true);
    const sync = (event: StorageEvent) => {
      if (event.key === SHORTLIST_KEY || event.key === null)
        setItems(parseShortlist(event.newValue));
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  function toggle(item: ShortlistItem) {
    try {
      // Read at the point of writing so separate tabs do not overwrite old state.
      const current = parseShortlist(localStorage.getItem(SHORTLIST_KEY));
      const exists = current.some((saved) => saved.key === item.key);
      if (!exists && current.length >= 100) {
        setMessage("Your shortlist is full. Remove an item to save another.");
        return;
      }
      const next = exists ? current.filter((saved) => saved.key !== item.key) : [...current, item];
      localStorage.setItem(SHORTLIST_KEY, JSON.stringify(next));
      setItems(next);
      setMessage(`${item.name} ${exists ? "removed" : "saved on this device"}.`);
    } catch {
      setMessage("Your browser could not save this item. Please check your storage settings.");
    }
  }
  return { items, ready, message, toggle };
}
