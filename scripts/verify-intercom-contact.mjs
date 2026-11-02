// Pure contact handoff checks. No browser, database, API token or outgoing messages.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import ts from "typescript";

const require = createRequire(import.meta.url);
const source = readFileSync(
  new URL("../src/lib/athrecs/intercom-contact.ts", import.meta.url),
  "utf8",
);
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
});
const module = { exports: {} };
new Function("require", "exports", "module", outputText)(require, module.exports, module);
const { intercomContactLinks, intercomDraftText } = module.exports;

function checkDestination(href, key, value, workspace = "uyeuotsk") {
  assert(href, "A usable contact produces a link");
  const url = new URL(href);
  assert.equal(url.origin, "https://app.intercom.com");
  assert.equal(url.pathname, `/apps/${workspace}/users/show`);
  assert.equal(url.username, "");
  assert.equal(url.password, "");
  assert.equal(url.hash, "");
  assert.deepEqual(
    [...url.searchParams],
    [[key, value]],
    "One exact identity, no extra parameters",
  );
}

const identity = {
  userId: "athlete/one?email=wrong@example.test&user_id=other#fragment",
  email: "runner+trial@example.test",
};
const links = intercomContactLinks(identity);
checkDestination(links.account, "user_id", identity.userId);
checkDestination(links.email, "email", identity.email);
assert.notEqual(links.account, links.email, "Email fallback must not replace the account-ID link");
checkDestination(
  intercomContactLinks({ userId: "athlete%26email%3Dother@else.test" }).account,
  "user_id",
  "athlete%26email%3Dother@else.test",
);
checkDestination(
  intercomContactLinks({ email: "  runner+trial@example.test  " }).email,
  "email",
  identity.email,
);
checkDestination(
  intercomContactLinks({ userId: "synthetic-athlete" }, "test1234").account,
  "user_id",
  "synthetic-athlete",
  "test1234",
);

for (const userId of [
  undefined,
  null,
  "",
  " ",
  "\n",
  " athlete",
  "athlete\tother",
  "a\0b",
  "x".repeat(201),
]) {
  const result = intercomContactLinks({ userId, email: identity.email });
  assert.equal(
    result.account,
    null,
    "Invalid account IDs never target another contact by trimming",
  );
  checkDestination(result.email, "email", identity.email);
}
for (const email of [
  undefined,
  null,
  "",
  " ",
  "invalid",
  "runner@example.test&user_id=other",
  "runner@example.test\r\nBcc:other@example.test",
]) {
  const result = intercomContactLinks({ userId: "synthetic-athlete", email });
  assert.equal(result.email, null, "Invalid email never becomes a contact lookup");
  checkDestination(result.account, "user_id", "synthetic-athlete");
}
for (const appId of [
  "",
  " ",
  "uyeuotsk/../../evil",
  "uyeuotsk?email=other",
  "https://evil.example",
  "uyeuotsk#fragment",
]) {
  assert.deepEqual(intercomContactLinks(identity, appId), { account: null, email: null });
}
assert.deepEqual(intercomContactLinks({}), { account: null, email: null });

const draft = {
  subject: "Private result correction & follow-up",
  body: "Hi athlete,\n\n<script>doNotExecute()</script>\nPlease check your result.\n\nPaul",
};
assert.equal(intercomDraftText(draft), `Subject: ${draft.subject}\n\n${draft.body}`);
assert.deepEqual(
  intercomContactLinks({ ...identity, ...draft }),
  links,
  "Draft contents never enter the Intercom URL",
);
assert.equal(new URL(links.account).searchParams.has("body"), false);
assert.equal(new URL(links.account).searchParams.has("subject"), false);

console.log(
  "PASS: official Intercom destinations, exact encoded account/email targets, invalid-input rejection, separate email fallback and private clipboard drafts. No messages sent.",
);
