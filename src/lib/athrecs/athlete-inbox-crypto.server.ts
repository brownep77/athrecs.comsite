import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

export const ATHLETE_INBOX = "paul@athrecs.com";
export function inboxEncryptionReady() {
  return /^[a-f0-9]{64}$/i.test(process.env.ATHRECS_INBOX_ENCRYPTION_KEY ?? "");
}
function key() {
  if (!inboxEncryptionReady()) throw new Error("Inbox encryption is not configured.");
  return Buffer.from(process.env.ATHRECS_INBOX_ENCRYPTION_KEY!, "hex");
}
export function encryptInboxPassword(password: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  cipher.setAAD(Buffer.from(ATHLETE_INBOX));
  const value = Buffer.concat([cipher.update(password, "utf8"), cipher.final()]);
  return [
    "v1",
    iv.toString("base64"),
    cipher.getAuthTag().toString("base64"),
    value.toString("base64"),
  ].join(".");
}
export function decryptInboxPassword(encrypted: string) {
  const [version, iv, tag, value] = encrypted.split(".");
  if (version !== "v1" || !iv || !tag || !value) throw new Error("Invalid inbox connection.");
  const cipher = createDecipheriv("aes-256-gcm", key(), Buffer.from(iv, "base64"));
  cipher.setAAD(Buffer.from(ATHLETE_INBOX));
  cipher.setAuthTag(Buffer.from(tag, "base64"));
  return Buffer.concat([cipher.update(Buffer.from(value, "base64")), cipher.final()]).toString(
    "utf8",
  );
}
