import { ImapFlow, type ImapFlowOptions } from "imapflow";
import { simpleParser } from "mailparser";
import { ATHLETE_INBOX } from "./athlete-inbox-crypto.server";

const MAX_SOURCE_BYTES = 1024 * 1024;
export type InboxEnvelope = {
  uid: number;
  sender: string | null;
  subject: string;
  messageId: string;
  receivedAt: string;
  size: number;
};
export type InboxSession = {
  uidValidity: string;
  uidNext: number;
  recentStart(): Promise<number>;
  headers(afterUid: number): Promise<InboxEnvelope[]>;
  body(message: InboxEnvelope): Promise<string>;
  close(): Promise<void>;
};

/** Fixed host, verified TLS, EXAMINE and PEEK: never mutate the original mailbox. */
export async function openPrivateInbox(
  password: string,
  clientFactory = (options: ImapFlowOptions) => new ImapFlow(options),
): Promise<InboxSession> {
  const client = clientFactory({
    host: "mail.privateemail.com",
    port: 993,
    secure: true,
    auth: { user: ATHLETE_INBOX, pass: password },
    logger: false,
    disableAutoIdle: true,
    connectionTimeout: 12000,
    greetingTimeout: 12000,
    socketTimeout: 15000,
    tls: { rejectUnauthorized: true, minVersion: "TLSv1.2" },
  });
  client.on("error", () => {
    /* Socket failures are reported through the operation promise. */
  });
  // Bound the whole session as well as each socket operation.
  const timer = setTimeout(() => client.close(), 45000);
  timer.unref();
  const close = async () => {
    clearTimeout(timer);
    try {
      await client.logout();
    } catch {
      client.close();
    }
  };
  try {
    await client.connect();
    const mailbox = await client.mailboxOpen("INBOX", { readOnly: true });
    if (!mailbox.readOnly) throw new Error("Mailbox must be read only.");
    return {
      uidValidity: mailbox.uidValidity.toString(),
      uidNext: mailbox.uidNext,
      async recentStart() {
        const ids = await client.search(
          { since: new Date(Date.now() - 30 * 86400000) },
          { uid: true },
        );
        return ids && ids.length
          ? ids.reduce((min, uid) => Math.min(min, uid), mailbox.uidNext) - 1
          : mailbox.uidNext - 1;
      },
      async headers(afterUid) {
        // No IMAP request is issued from inside a fetch iterator.
        if (afterUid >= mailbox.uidNext - 1) return [];
        const found = await client.search({ uid: `${afterUid + 1}:*` }, { uid: true });
        const ids = (found || [])
          .filter((uid) => uid > afterUid)
          .sort((a, b) => a - b)
          .slice(0, 50);
        if (!ids.length) return [];
        const rows = await client.fetchAll(
          ids,
          {
            uid: true,
            envelope: true,
            internalDate: true,
            size: true,
          },
          { uid: true },
        );
        return rows
          .filter((row) => row.uid > afterUid && ids.includes(row.uid))
          .map((row) => ({
            uid: row.uid,
            sender:
              row.envelope?.from?.length === 1
                ? (row.envelope.from[0].address?.trim().toLowerCase() ?? null)
                : null,
            subject: row.envelope?.subject ?? "(No subject)",
            messageId: row.envelope?.messageId ?? "",
            receivedAt: (row.internalDate instanceof Date
              ? row.internalDate
              : new Date()
            ).toISOString(),
            size: row.size ?? MAX_SOURCE_BYTES + 1,
          }))
          .sort((a, b) => a.uid - b.uid);
      },
      async body(message) {
        if (message.size > MAX_SOURCE_BYTES)
          return "This email is too large to display here. Open your email inbox to read it and its attachments.";
        const row = await client.fetchOne(
          message.uid,
          { source: { start: 0, maxLength: MAX_SOURCE_BYTES + 1 } },
          { uid: true },
        );
        if (!row || !row.source) throw new Error("Email could not be retrieved.");
        if (row.source.length > MAX_SOURCE_BYTES)
          return "This email is too large to display here. Open your email inbox to read it and its attachments.";
        const parsed = await simpleParser(row.source, {
          skipImageLinks: true,
          skipTextToHtml: true,
          maxHtmlLengthToParse: MAX_SOURCE_BYTES,
        });
        const attachments = parsed.attachments.map((a) => a.filename || "Attachment").slice(0, 30);
        return (
          (parsed.text?.trim() || "No readable message text.") +
          (attachments.length
            ? `\n\nAttachments: ${attachments.join(", ")}\nOpen your email inbox to download attachments.`
            : "")
        );
      },
      close,
    };
  } catch {
    await close();
    throw new Error(
      "Could not connect to paul@athrecs.com. Check the mailbox password and IMAP access.",
    );
  }
}
