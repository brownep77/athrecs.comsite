import { request } from "node:http";
import { performance } from "node:perf_hooks";

const maxResponseBytes = 32 * 1024 * 1024;

function safeMessage(value) {
  return String(value)
    .replace(/[\r\n\u0000-\u001f]+/g, " ")
    .replace(/(?:data:[^;,\s]+;base64,)?[A-Za-z0-9+/]{160,}={0,2}/g, "[encoded data omitted]")
    .slice(0, 1200);
}

/**
 * One request to a credential-free loopback Appium server. The absolute deadline
 * covers connection, headers and body; redirects and retries are never followed.
 * Response data is returned as W3C `value` and is never included in diagnostics.
 */
export async function requestAppiumJson({ endpoint, method, route, body, timeout = 65000 }) {
  const started = performance.now();
  const methodLabel = typeof method === "string" ? method.toUpperCase() : "<invalid method>";
  const routeLabel = typeof route === "string" ? safeMessage(route) : "<invalid route>";
  function error(code, detail, cause, statusCode) {
    const elapsedMs = Math.round(performance.now() - started);
    const failure = new Error(
      `${methodLabel} ${routeLabel}: ${code} after ${elapsedMs}ms: ${safeMessage(detail)}`,
      cause === undefined ? undefined : { cause },
    );
    Object.assign(failure, { code, method: methodLabel, route: routeLabel, elapsedMs });
    if (statusCode !== undefined) failure.statusCode = statusCode;
    return failure;
  }

  let base, url, payload;
  try {
    base = new URL(endpoint);
    if (
      base.protocol !== "http:" ||
      !["127.0.0.1", "localhost", "[::1]"].includes(base.hostname) ||
      base.username ||
      base.password ||
      base.pathname !== "/" ||
      base.search ||
      base.hash
    )
      throw new TypeError("Appium endpoint must be a credential-free loopback HTTP root URL");
    if (
      typeof route !== "string" ||
      !route.startsWith("/") ||
      route.startsWith("//") ||
      /[\\#\u0000-\u0020]/.test(route)
    )
      throw new TypeError("Appium route must be an absolute path without fragments or whitespace");
    url = new URL(route, base);
    if (url.origin !== base.origin || url.username || url.password)
      throw new TypeError("Appium route must remain on the configured loopback origin");
    if (!/^[A-Z]+$/.test(methodLabel)) throw new TypeError("Invalid HTTP method");
    if (!Number.isFinite(timeout) || timeout <= 0 || timeout > 2147483647)
      throw new TypeError("Request timeout must be a positive finite timer duration");
    if (body !== undefined) {
      payload = JSON.stringify(body);
      if (payload === undefined) throw new TypeError("Request body must be JSON serializable");
    }
  } catch (cause) {
    throw error("EINVAL", "Invalid Appium request configuration", cause);
  }

  const deadline = started + timeout;
  return new Promise((resolve, reject) => {
    let req, res, timer;
    let settled = false;
    function fail(failure) {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      reject(failure);
      res?.destroy();
      req?.destroy();
    }
    function expired() {
      const cause = new Error(`Absolute request deadline of ${timeout}ms exceeded`);
      cause.code = "ETIMEDOUT";
      fail(error("ETIMEDOUT", cause.message, cause));
    }
    function transportFailure(cause) {
      fail(error(cause.code || "EHTTP", cause.message || "HTTP transport failed", cause));
    }
    const remaining = () => Math.max(1, Math.ceil(deadline - performance.now()));
    if (performance.now() >= deadline) {
      expired();
      return;
    }
    timer = setTimeout(expired, remaining());
    try {
      req = request(
        {
          protocol: "http:",
          // Resolve localhost directly to loopback, without a DNS lookup.
          hostname:
            base.hostname === "localhost" ? "127.0.0.1" : base.hostname.replace(/^\[|\]$/g, ""),
          port: base.port || 80,
          method: methodLabel,
          path: url.pathname + url.search,
          agent: false,
          headers: {
            Host: base.host,
            Accept: "application/json",
            "Accept-Encoding": "identity",
            "Content-Type": "application/json",
            Connection: "close",
            ...(payload === undefined ? {} : { "Content-Length": Buffer.byteLength(payload) }),
          },
        },
        (response) => {
          res = response;
          if (settled) {
            res.destroy();
            return;
          }
          res.setTimeout(remaining(), expired);
          let bytes = 0;
          const chunks = [];
          res.on("error", transportFailure);
          res.on("aborted", () => {
            const cause = new Error("Response ended before the complete HTTP body arrived");
            cause.code = "ECONNRESET";
            transportFailure(cause);
          });
          res.on("data", (chunk) => {
            if (settled) return;
            if (performance.now() >= deadline) {
              expired();
              return;
            }
            bytes += chunk.length;
            if (bytes > maxResponseBytes) {
              fail(error("ERESPONSETOOLARGE", "Response exceeded the 32 MiB limit"));
              return;
            }
            chunks.push(chunk);
          });
          res.on("end", () => {
            if (settled) return;
            if (performance.now() >= deadline) {
              expired();
              return;
            }
            let result, parseError;
            try {
              result = JSON.parse(Buffer.concat(chunks, bytes).toString("utf8"));
            } catch (cause) {
              parseError = cause;
            }
            if (performance.now() >= deadline) {
              expired();
              return;
            }
            const statusCode = res.statusCode;
            if (result?.value?.error) {
              const remote = safeMessage(result.value.error);
              const message = safeMessage(result.value.message || "Appium command failed");
              const cause = new Error(message);
              cause.code = remote;
              fail(
                error("EAPPIUM", `HTTP ${statusCode}: ${remote}: ${message}`, cause, statusCode),
              );
              return;
            }
            if (!statusCode || statusCode < 200 || statusCode >= 300) {
              fail(error("EHTTPSTATUS", `HTTP ${statusCode || "unknown"}`, parseError, statusCode));
              return;
            }
            if (parseError) {
              fail(error("EINVALIDJSON", "Response was not valid JSON", parseError, statusCode));
              return;
            }
            if (!result || typeof result !== "object" || !Object.hasOwn(result, "value")) {
              fail(error("EAPPIUMPROTOCOL", "Response has no W3C value", undefined, statusCode));
              return;
            }
            settled = true;
            clearTimeout(timer);
            resolve(result.value);
          });
        },
      );
      req.on("error", transportFailure);
      req.setTimeout(remaining(), expired);
      req.end(payload);
    } catch (cause) {
      transportFailure(cause);
    }
  });
}
