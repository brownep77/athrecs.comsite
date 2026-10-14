import {
  collectionSchema,
  validateCollectionPage,
  type BrowserCollection,
} from "./browser-collection";
import { parseBrowserCapture } from "./browser-capture";

export type PendingBrowserCapture = {
  id: string;
  json: string;
  receivedAt: number;
  title: string;
  sourceUrl: string;
  rows: number;
  collection?: BrowserCollection;
};
const maxAge = 24 * 60 * 60 * 1000;
async function database() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open("athrecs-browser-imports", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("captures", { keyPath: "id" });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(
        new Error(
          "Browser storage is unavailable. Download the file and upload it in AthRecs instead.",
        ),
      );
  });
}
export async function pendingBrowserCaptures(): Promise<PendingBrowserCapture[]> {
  const db = await database();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction("captures", "readwrite");
      const store = tx.objectStore("captures");
      const request = store.getAll();
      let pending: PendingBrowserCapture[] = [];
      request.onsuccess = () => {
        const all = request.result as PendingBrowserCapture[];
        pending = all.filter((item) => Date.now() - item.receivedAt < maxAge);
        for (const item of all) if (!pending.includes(item)) store.delete(item.id);
      };
      tx.oncomplete = () => resolve(pending.sort((a, b) => a.receivedAt - b.receivedAt));
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}
export async function queueBrowserCapture(id: string, json: string, incomingCollection?: unknown) {
  if (!/^[a-f0-9-]{36}$/i.test(id)) throw new Error("Invalid import handoff.");
  const collection =
    incomingCollection === undefined ? undefined : collectionSchema.parse(incomingCollection);
  const parsed = collection
    ? validateCollectionPage(json, collection, 1)
    : parseBrowserCapture(json);
  const pending = await pendingBrowserCaptures();
  const previous = pending.find((item) => item.id === id);
  if (previous) {
    if (
      previous.json !== json ||
      JSON.stringify(previous.collection) !== JSON.stringify(collection)
    )
      throw new Error("This handoff already contains a different capture.");
    return previous;
  }
  const item: PendingBrowserCapture = {
    id,
    json,
    receivedAt: Date.now(),
    title: parsed.pageTitle,
    sourceUrl: parsed.sourceUrl,
    rows: parsed.table.rows.length,
    ...(collection ? { collection } : {}),
  };
  const db = await database();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("captures", "readwrite");
      const store = tx.objectStore("captures");
      // Check the limit inside the same transaction, including simultaneous tabs.
      const count = store.count();
      count.onsuccess = () => {
        if (count.result >= 10) tx.abort();
        else store.add(item);
      };
      tx.oncomplete = () => resolve();
      tx.onerror = () =>
        reject(new Error("Could not keep the capture in this browser. Download it instead."));
      tx.onabort = () =>
        reject(
          new Error("Finish or discard pending imports before sending more pages (maximum 10)."),
        );
    });
  } finally {
    db.close();
  }
  return item;
}
export async function discardBrowserCapture(id: string) {
  const db = await database();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("captures", "readwrite");
      tx.objectStore("captures").delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}
