import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import ts from "typescript";

// Execute the real browser modules with deterministic DOM, clock, auth and SDK
// boundaries. No network, production accounts or actual Intercom contacts exist.
const sources = await Promise.all([
  readFile(new URL("../src/lib/athrecs/intercom.ts", import.meta.url), "utf8"),
  readFile(new URL("../src/components/assistant/IntercomMessenger.tsx", import.meta.url), "utf8"),
]);

const plain = (value) => JSON.parse(JSON.stringify(value));
const flush = async () => {
  for (let i = 0; i < 8; i += 1) await Promise.resolve();
};
const deferred = () => {
  let resolve, reject;
  const promise = new Promise((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
};

function harness({ storedAccount = null, storageDenied = false, mobile = false } = {}) {
  let now = Date.UTC(2026, 9, 28, 12);
  let timerId = 0;
  let requests = 0;
  let state = { user: null, isPending: false, hasSessionError: false };
  let responder = async () => ({ status: "disabled" });
  const timers = new Map();
  const sdk = [];
  const cookieWrites = [];
  const cookies = new Map();
  const stored = new Map();
  const nodes = new Map();
  const appId = "testapp1";
  const accountKey = `athrecs.intercom.account.${appId}`;
  if (storedAccount) stored.set(accountKey, storedAccount);

  const window = new EventTarget();
  window.location = { hostname: "www.athrecs.com", pathname: "/athletes" };
  window.matchMedia = () => ({ matches: mobile });
  const localStorage = {
    getItem: (key) => stored.get(key) ?? null,
    setItem: (key, value) => {
      stored.set(key, String(value));
    },
    removeItem: (key) => {
      stored.delete(key);
    },
  };
  Object.defineProperty(window, "localStorage", {
    get: () => {
      if (storageDenied) throw new Error("storage blocked");
      return localStorage;
    },
  });
  const document = new EventTarget();
  document.visibilityState = "visible";
  document.createElement = (tag) => ({ tagName: tag.toUpperCase() });
  document.getElementById = (id) => nodes.get(id) ?? null;
  document.head = {
    appendChild(node) {
      nodes.set(node.id, node);
      const queued = window.Intercom?.q ?? [];
      window.Intercom = (...args) => sdk.push(plain(args));
      queued.forEach((args) => window.Intercom(...args));
    },
  };
  const addCookie = (name, value, domain = "www.athrecs.com") => {
    cookies.set(`${name}|${domain.replace(/^\./, "")}`, value);
  };
  Object.defineProperty(document, "cookie", {
    get: () => [...cookies].map(([key, value]) => `${key.split("|")[0]}=${value}`).join("; "),
    set: (text) => {
      cookieWrites.push(text);
      const parts = text.split(";").map((part) => part.trim());
      const [name, value = ""] = parts[0].split("=");
      const domain = (
        parts.find((part) => /^domain=/i.test(part))?.slice(7) ?? window.location.hostname
      ).replace(/^\./, "");
      const key = `${name}|${domain}`;
      if (parts.some((part) => /^max-age=0$/i.test(part))) cookies.delete(key);
      else cookies.set(key, value);
    },
  });

  const setTimeout = (fn, delay = 0) => {
    const id = ++timerId;
    timers.set(id, { fn, at: now + Math.max(0, delay) });
    return id;
  };
  const clearTimeout = (id) => timers.delete(id);
  class ClockDate extends Date {
    static now() {
      return now;
    }
  }
  const context = vm.createContext({
    window,
    document,
    Event,
    Date: ClockDate,
    console,
    setTimeout,
    clearTimeout,
    __env: { VITE_INTERCOM_APP_ID: appId },
  });

  let hookCursor = 0;
  const hooks = [];
  let pendingEffects = [];
  function useEffect(effect, dependencies) {
    const index = hookCursor++;
    const prior = hooks[index];
    if (
      !prior ||
      dependencies.length !== prior.dependencies.length ||
      dependencies.some((v, i) => !Object.is(v, prior.dependencies[i]))
    ) {
      pendingEffects.push({ index, effect, dependencies });
    }
  }
  function load(source, filename, imports) {
    const compiled = ts.transpileModule(source.replaceAll("import.meta.env", "__env"), {
      fileName: filename,
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
      },
    }).outputText;
    const module = { exports: {} };
    const run = vm.runInContext(`(function(require, module, exports) { ${compiled}\n})`, context, {
      filename,
    });
    run(
      (name) => {
        if (!(name in imports)) throw new Error(`Unmocked import: ${name}`);
        return imports[name];
      },
      module,
      module.exports,
    );
    return module.exports;
  }
  const intercom = load(sources[0], "intercom.ts", {
    "@/lib/site-scope": { IS_ATHRECS_SITE: true },
  });
  const component = load(sources[1], "IntercomMessenger.tsx", {
    react: { useEffect },
    "react/jsx-runtime": { jsx: () => null, jsxs: () => null },
    "lucide-react": { MessageCircle: () => null },
    "@/lib/athrecs/intercom": intercom,
    "@/lib/athrecs/intercom-api": {
      getIntercomIdentity: () => {
        requests += 1;
        return responder();
      },
    },
    "@/lib/auth/use-current-user": { useCurrentUserState: () => state },
  });
  const render = (nextState, pathname = "/athletes") => {
    state = { ...state, ...nextState };
    hookCursor = 0;
    pendingEffects = [];
    component.IntercomMessenger({ pathname });
    // React runs changed-effect cleanups before the next effect setup pass.
    pendingEffects.forEach(({ index }) => hooks[index]?.cleanup?.());
    pendingEffects.forEach(({ index, effect, dependencies }) => {
      hooks[index] = { dependencies, cleanup: effect() };
    });
  };
  const advance = async (ms) => {
    const target = now + ms;
    let steps = 0;
    while (true) {
      const next = [...timers]
        .filter(([, task]) => task.at <= target)
        .sort((a, b) => a[1].at - b[1].at)[0];
      if (!next) break;
      assert.ok(++steps < 1000, "timer loop does not settle");
      const [id, task] = next;
      timers.delete(id);
      now = task.at;
      task.fn();
      await flush();
    }
    now = target;
    await flush();
  };
  const identity = (userId, suffix = "1") => ({
    status: "ready",
    userId,
    jwt: `synthetic-${userId}-${suffix}`,
    expiresAt: Math.floor(now / 1000) + 3600,
  });
  const storageEvent = (key, newValue) => {
    if (newValue === null) stored.delete(key);
    else stored.set(key, newValue);
    const event = new Event("storage");
    Object.assign(event, { key, newValue, oldValue: null });
    window.dispatchEvent(event);
  };
  return {
    intercom,
    sdk,
    cookies,
    cookieWrites,
    stored,
    nodes,
    timers,
    window,
    document,
    render,
    advance,
    identity,
    storageEvent,
    addCookie,
    respond: (fn) => {
      responder = fn;
    },
    calls: (method) => sdk.filter(([name]) => name === method),
    requestCount: () => requests,
    jump: (ms) => {
      now += ms;
    },
    unmount: () => {
      hooks.forEach((hook) => hook?.cleanup?.());
    },
  };
}

const signed = (id) => ({
  user: {
    id,
    displayName: `Synthetic ${id}`,
    primaryEmail: `${id}@example.test`,
    isDevFallback: false,
  },
  isPending: false,
  hasSessionError: false,
});
const guest = { user: null, isPending: false, hasSessionError: false };
const checks = [];
const test = (name, run) => checks.push({ name, run });

test("initial pending hydration neither boots nor erases a visitor's conversation", async () => {
  const h = harness();
  h.addCookie("intercom-id-testapp1", "anonymous-history", "athrecs.com");
  h.render({ user: null, isPending: true });
  await flush();
  assert.equal(h.sdk.length, 0);
  assert.equal(h.requestCount(), 0);
  assert.equal(h.cookies.size, 1);
  h.respond(async () => h.identity("athlete-a"));
  h.render(signed("athlete-a"));
  await flush();
  assert.equal(h.calls("boot").length, 1);
  assert.equal(h.cookies.size, 1, "genuine visitor login preserves anonymous conversation");
});

test("member boot sends only signed identity and stores no token or contact details", async () => {
  const h = harness({ mobile: true });
  h.respond(async () => h.identity("athlete-a"));
  h.render(signed("athlete-a"));
  await flush();
  const settings = h.calls("boot")[0][1];
  assert.equal(settings.intercom_user_jwt, "synthetic-athlete-a-1");
  assert.equal(settings.vertical_padding, 88);
  for (const field of ["user_id", "name", "email", "user_hash"])
    assert.equal(settings[field], undefined);
  assert.deepEqual([...h.stored.values()], ["athlete-a"]);
  assert.equal(h.nodes.size, 1);
  h.render(signed("athlete-a"), "/athletes/someone-else");
  await flush();
  assert.equal(h.requestCount(), 1, "browsing a public profile never changes account identity");
});

test("anonymous to member retains conversation and reuses one widget script", async () => {
  const h = harness();
  h.render(guest);
  h.addCookie("intercom-id-testapp1", "visitor-lead", "athrecs.com");
  h.respond(async () => h.identity("athlete-a"));
  h.render(signed("athlete-a"));
  await flush();
  assert.equal(h.calls("shutdown").length, 0);
  assert.equal(h.calls("boot").length, 2);
  assert.equal(h.nodes.size, 1);
  assert.equal(h.cookies.get("intercom-id-testapp1|athrecs.com"), "visitor-lead");
});

test("an anonymous session survives a pending authentication recheck", async () => {
  const h = harness();
  h.render(guest);
  h.addCookie("intercom-id-testapp1", "visitor-lead", "athrecs.com");
  h.render({ user: null, isPending: true });
  assert.equal(h.calls("shutdown").length, 0);
  assert.equal(h.cookies.get("intercom-id-testapp1|athrecs.com"), "visitor-lead");
  h.respond(async () => h.identity("athlete-a"));
  h.render(signed("athlete-a"));
  await flush();
  assert.equal(h.calls("shutdown").length, 0);
  assert.equal(h.calls("boot").at(-1)[1].intercom_user_jwt, "synthetic-athlete-a-1");
});

test("A to B clears A's host and parent-domain cookies before B boots", async () => {
  const h = harness();
  h.respond(async () => h.identity("athlete-a"));
  h.render(signed("athlete-a"));
  await flush();
  h.addCookie("intercom-session-testapp1", "old-member-a");
  h.addCookie("intercom-id-testapp1", "old-lead-a", "athrecs.com");
  h.addCookie("essential-preference", "keep", "athrecs.com");
  h.respond(async () => h.identity("athlete-b"));
  h.render(signed("athlete-b"));
  assert.equal(h.cookies.size, 1, "account cleanup occurs before asynchronous identity returns");
  await flush();
  const shutdown = h.sdk.findIndex(([method]) => method === "shutdown");
  const bootB = h.sdk.findIndex(
    ([method, value]) => method === "boot" && value?.intercom_user_jwt === "synthetic-athlete-b-1",
  );
  assert.ok(shutdown >= 0 && bootB > shutdown);
  assert.equal(h.cookies.get("essential-preference|athrecs.com"), "keep");
});

test("expired AthRecs login on a fresh document cannot reuse the old member cookie", async () => {
  const h = harness({ storedAccount: "athlete-a" });
  h.addCookie("intercom-id-testapp1", "old-member-a", "athrecs.com");
  h.render({ user: null, isPending: true });
  assert.equal(h.cookies.size, 1, "wait for auth before deciding it is logged out");
  h.render(guest);
  await flush();
  assert.equal(h.cookies.size, 0);
  assert.equal(h.calls("boot")[0][1].intercom_user_jwt, undefined);
  assert.equal(h.stored.get(h.intercom.INTERCOM_ACCOUNT_KEY), undefined);
});

test("logout invalidates a pending token and resets immediately before navigation", async () => {
  const h = harness();
  const delayed = deferred();
  h.respond(() => delayed.promise);
  h.render(signed("athlete-a"));
  h.addCookie("intercom-id-testapp1", "a", "athrecs.com");
  h.intercom.endIntercomSession();
  assert.equal(h.cookies.size, 0);
  delayed.resolve(h.identity("athlete-a"));
  await flush();
  assert.equal(h.calls("boot").length, 0);
  assert.equal(h.timers.size, 0);
  h.jump(10 * 60_000);
  h.window.dispatchEvent(new Event("focus"));
  await flush();
  assert.equal(
    h.requestCount(),
    1,
    "explicit logout must not re-identify on focus before auth changes",
  );
});

test("provider account switching invalidates a first token while retaining genuine visitor cookies", async () => {
  const h = harness();
  const delayed = deferred();
  h.addCookie("intercom-id-testapp1", "visitor-lead", "athrecs.com");
  h.respond(() => delayed.promise);
  h.render(signed("athlete-a"));
  h.intercom.endIntercomSession(true);
  assert.equal(h.cookies.get("intercom-id-testapp1|athrecs.com"), "visitor-lead");
  delayed.resolve(h.identity("athlete-a"));
  await flush();
  assert.equal(h.calls("boot").length, 0);
  assert.equal(h.timers.size, 0);
  h.respond(async () => h.identity("athlete-b"));
  h.render(signed("athlete-b"));
  await flush();
  assert.equal(h.calls("boot").at(-1)[1].intercom_user_jwt, "synthetic-athlete-b-1");
});

test("late A token cannot overwrite a subsequently authenticated B", async () => {
  const h = harness();
  const delayedA = deferred();
  h.respond(() => delayedA.promise);
  h.render(signed("athlete-a"));
  h.respond(async () => h.identity("athlete-b"));
  h.render(signed("athlete-b"));
  await flush();
  delayedA.resolve(h.identity("athlete-a"));
  await flush();
  assert.deepEqual(
    h.calls("boot").map(([, settings]) => settings.intercom_user_jwt),
    ["synthetic-athlete-b-1"],
  );
});

test("missing secret retains clean anonymous chat; dev fallback never requests identity", async () => {
  const h = harness({ storedAccount: "athlete-a" });
  h.addCookie("intercom-id-testapp1", "old-a", "athrecs.com");
  h.render(signed("athlete-a"));
  await flush();
  assert.equal(h.cookies.size, 0);
  assert.equal(h.calls("boot")[0][1].intercom_user_jwt, undefined);
  const dev = harness();
  dev.render({ ...signed("dev-user"), user: { ...signed("dev-user").user, isDevFallback: true } });
  await flush();
  assert.equal(dev.requestCount(), 0);
  assert.equal(dev.calls("boot")[0][1].intercom_user_jwt, undefined);
});

test("identity mismatch and session errors fail closed without anonymous PII", async () => {
  const h = harness();
  h.respond(async () => h.identity("athlete-b"));
  h.render(signed("athlete-a"));
  await flush();
  assert.equal(h.calls("boot").length, 0);
  h.respond(async () => h.identity("athlete-a"));
  await h.advance(30_000);
  assert.equal(h.calls("boot").length, 1);
  h.addCookie("intercom-session-testapp1", "a", "athrecs.com");
  h.render({ user: null, isPending: false, hasSessionError: true });
  assert.equal(h.cookies.size, 0);
  assert.equal(h.intercom.openIntercomMessage("hello"), false);
  assert.equal(h.calls("boot").length, 1, "authentication failure must not silently boot as guest");
});

test("token refresh updates an existing user and page updates stay throttled", async () => {
  const h = harness();
  let serial = 0;
  h.respond(async () => h.identity("athlete-a", String(++serial)));
  h.render(signed("athlete-a"));
  await flush();
  for (let i = 0; i < 30; i += 1) h.render(signed("athlete-a"), `/races/${i}`);
  assert.equal(h.calls("update").length, 0);
  await h.advance(3 * 60_000);
  h.render(signed("athlete-a"), "/races/next");
  assert.equal(h.calls("update").length, 1);
  assert.equal(h.calls("update")[0][1].intercom_user_jwt, "synthetic-athlete-a-1");
  await h.advance(2 * 60_000);
  assert.equal(h.calls("boot").length, 1, "refresh must not reboot the same account");
  assert.equal(h.calls("update").at(-1)[1].intercom_user_jwt, "synthetic-athlete-a-2");
  h.window.dispatchEvent(new Event("focus"));
  await flush();
  assert.equal(h.requestCount(), 2, "focus immediately after refresh must not flood the API");
});

test("refresh network failure clears member state and recovers on a bounded retry", async () => {
  const h = harness();
  h.respond(async () => h.identity("athlete-a"));
  h.render(signed("athlete-a"));
  await flush();
  h.addCookie("intercom-session-testapp1", "a");
  h.respond(async () => {
    throw new Error("synthetic unavailable");
  });
  await h.advance(5 * 60_000);
  assert.equal(h.cookies.size, 0);
  assert.equal(h.intercom.openIntercomMessage("test"), false);
  assert.equal(
    h.stored.get(h.intercom.INTERCOM_ACCOUNT_KEY),
    "athlete-a",
    "a transient failure must retain the cleanup hint instead of logging out other tabs",
  );
  h.respond(async () => h.identity("athlete-a", "recovered"));
  await h.advance(30_000);
  assert.equal(h.calls("boot").at(-1)[1].intercom_user_jwt, "synthetic-athlete-a-recovered");
});

test("other-tab logout cancels in-flight responses and leaves no live member chat", async () => {
  const h = harness();
  const delayed = deferred();
  h.respond(() => delayed.promise);
  h.render(signed("athlete-a"));
  h.addCookie("intercom-id-testapp1", "a", "athrecs.com");
  h.storageEvent(h.intercom.INTERCOM_LOGOUT_KEY, "synthetic-other-tab-logout");
  delayed.resolve(h.identity("athlete-a"));
  await flush();
  assert.equal(h.cookies.size, 0);
  assert.equal(h.calls("boot").length, 0);
  assert.equal(h.timers.size, 0);
  h.jump(10 * 60_000);
  h.window.dispatchEvent(new Event("focus"));
  h.document.dispatchEvent(new Event("visibilitychange"));
  await flush();
  assert.equal(h.requestCount(), 1, "a remote explicit logout remains stopped on focus");
  assert.equal(h.calls("boot").length, 0);
});

test("other-tab marker change requires a fresh server check and then permits focus recovery", async () => {
  const h = harness();
  h.respond(async () => h.identity("athlete-a"));
  h.render(signed("athlete-a"));
  await flush();
  h.addCookie("intercom-session-testapp1", "old-a", "athrecs.com");
  const recovery = deferred();
  h.respond(() => recovery.promise);
  h.storageEvent(h.intercom.INTERCOM_ACCOUNT_KEY, "athlete-b");
  assert.equal(h.cookies.size, 0);
  assert.equal(h.stored.get(h.intercom.INTERCOM_ACCOUNT_KEY), "athlete-b");
  h.window.dispatchEvent(new Event("focus"));
  await flush();
  assert.equal(h.requestCount(), 2, "marker change allows an immediate new server check");
  assert.equal(h.calls("boot").length, 1, "the marker alone never identifies a member");
  recovery.resolve(h.identity("athlete-a", "fresh"));
  await flush();
  assert.equal(h.calls("boot").at(-1)[1].intercom_user_jwt, "synthetic-athlete-a-fresh");
  assert.equal(h.stored.get(h.intercom.INTERCOM_ACCOUNT_KEY), "athlete-a");
});

test("stale request completion after marker change cannot schedule over a fresh focus check", async () => {
  const h = harness();
  const stale = deferred();
  const fresh = deferred();
  h.respond(() => stale.promise);
  h.render(signed("athlete-a"));
  h.storageEvent(h.intercom.INTERCOM_ACCOUNT_KEY, "athlete-b");
  h.respond(() => fresh.promise);
  h.window.dispatchEvent(new Event("focus"));
  assert.equal(h.requestCount(), 2);
  stale.resolve(h.identity("athlete-a", "stale"));
  await flush();
  assert.equal(h.calls("boot").length, 0);
  assert.equal(h.timers.size, 0, "stale finally must not create a competing refresh timer");
  fresh.resolve(h.identity("athlete-a", "fresh"));
  await flush();
  assert.deepEqual(
    h.calls("boot").map(([, settings]) => settings.intercom_user_jwt),
    ["synthetic-athlete-a-fresh"],
  );
  assert.equal(h.timers.size, 1);
});

test("marker change cannot switch the account when the server and current auth disagree", async () => {
  const h = harness();
  h.respond(async () => h.identity("athlete-a"));
  h.render(signed("athlete-a"));
  await flush();
  h.storageEvent(h.intercom.INTERCOM_ACCOUNT_KEY, "athlete-b");
  h.respond(async () => h.identity("athlete-b"));
  h.window.dispatchEvent(new Event("focus"));
  await flush();
  assert.equal(h.calls("boot").length, 1, "B cannot boot while the rendered account is A");
  assert.equal(
    h.stored.get(h.intercom.INTERCOM_ACCOUNT_KEY),
    "athlete-b",
    "mismatch keeps the cleanup hint",
  );
  h.render(signed("athlete-b"));
  await flush();
  assert.equal(h.calls("boot").at(-1)[1].intercom_user_jwt, "synthetic-athlete-b-1");
});

test("storage restrictions cannot preserve an unknown prior account", async () => {
  const h = harness({ storageDenied: true });
  h.addCookie("intercom-id-testapp1", "unknown-member", "athrecs.com");
  h.render(guest);
  await flush();
  assert.equal(h.cookies.size, 0);
  assert.equal(h.calls("boot").length, 1);
});

test("unmount invalidates a pending response and cleans the widget", async () => {
  const h = harness();
  const delayed = deferred();
  h.respond(() => delayed.promise);
  h.render(signed("athlete-a"));
  h.unmount();
  delayed.resolve(h.identity("athlete-a"));
  await flush();
  assert.equal(h.calls("boot").length, 0);
  assert.equal(h.timers.size, 0);
});

test("unmount clears the member session while retaining the non-authenticating account hint", async () => {
  const h = harness();
  h.respond(async () => h.identity("athlete-a"));
  h.render(signed("athlete-a"));
  await flush();
  h.addCookie("intercom-session-testapp1", "a", "athrecs.com");
  h.unmount();
  assert.equal(h.cookies.size, 0);
  assert.equal(h.intercom.openIntercomMessage("test"), false);
  assert.equal(h.stored.get(h.intercom.INTERCOM_ACCOUNT_KEY), "athlete-a");
  assert.equal(h.timers.size, 0);
});

let failed = 0;
for (const { name, run } of checks) {
  try {
    await run();
    console.log(`PASS ${name}`);
  } catch (error) {
    failed += 1;
    console.error(`FAIL ${name}`);
    console.error(error);
  }
}
assert.equal(failed, 0, `${failed} Intercom lifecycle checks failed`);
console.log(
  `Intercom browser lifecycle: ${checks.length} checks passed; no external requests made.`,
);
