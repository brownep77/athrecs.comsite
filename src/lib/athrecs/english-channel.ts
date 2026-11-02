export type ChannelFact = { label: string; value: string };
export type ChannelLine = { text: string; label?: string; url?: string; heading?: boolean };
export type ChannelCard = { id?: string; title: string; lines: ChannelLine[] };
export type ChannelFlag = { code: string; label: string; abbr: string };
export type ChannelProfile = {
  slug: string;
  name: string;
  country: string;
  aliases: string[];
  highlight: string;
  biography: string[];
  flags: ChannelFlag[];
  facts: ChannelFact[];
  crossings: ChannelCard[];
  otherEvents: ChannelCard[];
  milestones: ChannelCard[];
  media: ChannelCard[];
  questions: ChannelFact[];
  sources: ChannelCard[];
  nativeCrossings: ChannelCard[];
  nativeOtherEvents: ChannelCard[];
  checkedAt: string;
  revision: string;
};
export const channelPath = "/swimming/english-channel";
function isRelay(card: ChannelCard) {
  return card.lines.some(
    (line) =>
      /relay.*team performance|team elapsed time/i.test([line.label, line.text].join(" ")) ||
      (/\brelay\b/i.test(card.title) && /^team (performance|result)$/i.test(line.label ?? "")),
  );
}

export function channelQuestions(p: ChannelProfile) {
  const relays = p.nativeCrossings.filter(isRelay).length;
  const solos = p.nativeCrossings.length - relays;
  return p.questions.map((q) => {
    if (q.label !== `Which English Channel swims are included for ${p.name}?`) return q;
    const events = [
      solos && `${solos} selected solo performance${solos === 1 ? "" : "s"}`,
      relays && `${relays} named relay participation${relays === 1 ? "" : "s"}`,
    ]
      .filter(Boolean)
      .join(" and ");
    return {
      ...q,
      value: `This profile includes ${events} for ${p.name}. Each continuous multi-way swim counts as one performance.`,
    };
  });
}

export function channelListing(p: ChannelProfile) {
  return {
    slug: p.slug,
    name: p.name,
    country: p.country,
    flags: p.flags,
    aliases: p.aliases,
    highlight: p.highlight,
    swims: p.crossings.length,
    events: p.otherEvents.length,
    checkedAt: p.checkedAt,
    eventNames: p.otherEvents.map((c) => c.title),
    relay: p.nativeCrossings.some(isRelay),
  };
}
export type ChannelListing = ReturnType<typeof channelListing>;
export function channelNative(p: ChannelProfile) {
  const cards = (items: ChannelCard[]) =>
    items.map(({ title, lines }) => ({
      title,
      lines: lines.map(({ text, label, heading }) => ({ text, label, heading })),
    }));
  return {
    slug: p.slug,
    highlight: p.highlight,
    aliases: p.aliases,
    flags: p.flags,
    facts: p.facts,
    questions: p.questions,
    crossings: cards(p.nativeCrossings),
    otherEvents: cards(p.nativeOtherEvents),
    milestones: cards(p.milestones),
  };
}
export type ChannelNative = ReturnType<typeof channelNative>;
