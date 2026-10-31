import { readReviewedChannelRows } from "./channel-publication-query";
import type { Sql } from "../db";
import { getSql } from "../db";
import { channelListing, channelNative, type ChannelProfile } from "./english-channel";
import { IS_RUNRECS_SITE } from "../site-scope";

const files = import.meta.glob<ChannelProfile>("../../data/channel-publication/*.json", {
  eager: true,
  import: "default",
});
const profiles = new Map(Object.values(files).map((p) => [p.slug, p]));

// Only the exact unclaimed native biography and the reviewed archive revision
// may expose this editorial dossier. A later claim or withdrawn approval closes it.
export async function readChannelProfiles(sql: Sql, slug?: string) {
  return IS_RUNRECS_SITE ? [] : readReviewedChannelRows(sql, profiles, slug);
}
export async function listPublishedChannel() {
  return (await readChannelProfiles(await getSql())).map(channelListing);
}
export async function publishedChannel(slug: string) {
  const [p] = await readChannelProfiles(await getSql(), slug);
  return p || null;
}
export async function nativeChannel(slug: string) {
  const p = await publishedChannel(slug);
  return p ? channelNative(p) : undefined;
}
