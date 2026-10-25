import https from "node:https";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile, rename, mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { load } from "cheerio";

const exec = promisify(execFile);
const PRODUCT = "AthRecsStartTimes";
const AGENT = `${PRODUCT}/1.0 (+https://athrecs.com)`;
export const digest = (value) => createHash("sha256").update(value).digest("hex");
export async function writeJson(path, value) {
  const temporary = `${path}.${process.pid}.tmp`;
  await writeFile(temporary, JSON.stringify(value, null, 2), { mode: 0o600 });
  await rename(temporary, path);
}

/** For captures made by an approved browser/public-web transport. This does not verify authority. */
export async function importSourceCaptures(captures, directory) {
  if (!Array.isArray(captures)) throw Error("Captures must be a JSON array");
  const checked = captures.map((capture) => {
    const url = publicUrl(capture.url);
    if (
      capture.status !== 200 ||
      typeof capture.text !== "string" ||
      !capture.text.trim() ||
      capture.text.length > 6000000 ||
      !Array.isArray(capture.links) ||
      !Number.isFinite(Date.parse(capture.checkedAt)) ||
      Date.parse(capture.checkedAt) > Date.now() ||
      !capture.captureOrigin?.trim()
    )
      throw Error(`Incomplete external capture: ${url}`);
    return {
      ...capture,
      url,
      finalUrl: publicUrl(capture.finalUrl ?? url),
      links: capture.links.flatMap((link) => {
        try {
          return [{ text: String(link.text ?? ""), url: publicUrl(link.url, url) }];
        } catch {
          return [];
        }
      }),
      textHash: digest(capture.text),
      imported: true,
    };
  });
  await mkdir(directory, { recursive: true, mode: 0o700 });
  for (const capture of checked)
    await writeJson(join(directory, `${digest(capture.url)}.json`), capture);
  return checked.length;
}

/** Public HTTPS only; every redirect and DNS answer is checked as well. */
export function publicUrl(value, base) {
  const url = new URL(value, base);
  if (url.href.length > 4096) throw Error("Source URL is too long");
  if (url.protocol === "http:") url.protocol = "https:";
  const host = url.hostname.toLowerCase();
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    (url.port && url.port !== "443") ||
    isIP(host.replace(/^\[|\]$/g, "")) ||
    !host.includes(".") ||
    /(?:^|\.)(?:localhost|local|internal|test|invalid|example|onion)$/.test(host)
  )
    throw Error("Not a public HTTPS source URL");
  url.hash = "";
  return url.href;
}

export function publicAddress(address) {
  if (isIP(address) === 4) {
    const [a, b, c] = address.split(".").map(Number);
    return !(
      a === 0 ||
      a === 10 ||
      a === 127 ||
      a >= 224 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && (b === 168 || b === 0 || (b === 88 && c === 99))) ||
      (a === 198 && (b === 18 || b === 19 || (b === 51 && c === 100))) ||
      (a === 203 && b === 0 && c === 113)
    );
  }
  // Only global unicast; exclude mapped, transition and documentation ranges.
  if (isIP(address) !== 6) return false;
  const lower = new URL(`https://[${address}]/`).hostname.slice(1, -1).toLowerCase();
  const ipv6Parts = lower.split(":");
  if (ipv6Parts[0] === "2001" && parseInt(ipv6Parts[1] || "0", 16) < 512) return false;
  return (
    isIP(address) === 6 &&
    /^[23][0-9a-f]{3}:/.test(lower) &&
    !/^(?:2001:(?:0:|db8:|2:|10:|20:)|2002:)/.test(lower)
  );
}

export function robotsPolicy(text, path) {
  if (/^\s*(?:<|access denied|forbidden|captcha)/i.test(text))
    throw Error("Crawl rules inaccessible");
  const groups = [];
  let group;
  let directives = false;
  for (const line of text.split(/\r?\n/)) {
    const match = line.split("#")[0].match(/^\s*([\w-]+)\s*:\s*(.*?)\s*$/);
    if (!match) continue;
    const [, rawKey, value] = match;
    const key = rawKey.toLowerCase();
    if (key === "user-agent") {
      if (!group || directives) {
        group = { agents: [], rules: [], delay: 1 };
        groups.push(group);
        directives = false;
      }
      group.agents.push(value.toLowerCase());
    } else if (group) {
      directives = true;
      if (["allow", "disallow"].includes(key) && value)
        group.rules.push({ allow: key === "allow", path: value });
      if (key === "crawl-delay") {
        if (!/^\d+(?:\.\d+)?$/.test(value)) throw Error("Crawl delay needs manual review");
        group.delay = Math.max(group.delay, Number(value));
      }
      if (key === "request-rate") {
        const rate = value.match(/^(\d+)\/(\d+)$/);
        if (!rate || Number(rate[1]) < 1) throw Error("Crawl rate needs manual review");
        group.delay = Math.max(group.delay, Number(rate[2]) / Number(rate[1]));
      }
    }
  }
  const specific = groups.filter((g) => g.agents.includes(PRODUCT.toLowerCase()));
  const selected = specific.length ? specific : groups.filter((g) => g.agents.includes("*"));
  let allowed = true,
    longest = -1;
  for (const rule of selected.flatMap((g) => g.rules)) {
    if (rule.path.length > 1000 || (rule.path.match(/\*/g)?.length ?? 0) > 5)
      throw Error("Crawl rules need manual review");
    const end = rule.path.endsWith("$");
    const pattern = end ? rule.path.slice(0, -1) : rule.path;
    let matches = new Uint8Array(path.length + 1);
    matches[0] = 1;
    for (const char of pattern) {
      const next = new Uint8Array(path.length + 1);
      if (char === "*") {
        next[0] = matches[0];
        for (let i = 1; i <= path.length; i++) next[i] = matches[i] || next[i - 1];
      } else {
        for (let i = 1; i <= path.length; i++) if (path[i - 1] === char) next[i] = matches[i - 1];
      }
      matches = next;
    }
    if ((end ? matches[path.length] : matches.some(Boolean)) && rule.path.length >= longest) {
      allowed = rule.path.length === longest ? allowed || rule.allow : rule.allow;
      longest = rule.path.length;
    }
  }
  const delay = Math.max(1, ...selected.map((g) => g.delay));
  if (delay > 30) throw Error("Published crawl delay exceeds this scanner’s request window");
  return { allowed, delay };
}

export function parseHtml(html, url) {
  const $ = load(html);
  $("script,style,noscript,svg").remove();
  const title = $("title").text().trim();
  const links = [];
  $("a[href]").each((_, el) => {
    try {
      links.push({
        text: $(el).text().replace(/\s+/g, " ").trim(),
        url: publicUrl($(el).attr("href"), url),
      });
    } catch {
      /* Non-page link. */
    }
  });
  $("br").replaceWith("\n");
  $("td,th").append(" | ");
  $("p,div,li,h1,h2,h3,h4,tr,section,article").append("\n");
  const text = $("body")
    .text()
    .split("\n")
    .map((s) => s.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n");
  return { title, text, links: [...new Map(links.map((l) => [l.url, l])).values()] };
}

async function pdfText(body) {
  const directory = await mkdtemp(join(tmpdir(), "athrecs-start-pdf-"));
  try {
    const file = join(directory, "source.pdf");
    await writeFile(file, body, { mode: 0o600 });
    const { stdout } = await exec("pdftotext", ["-layout", file, "-"], {
      timeout: 20000,
      maxBuffer: 6 * 1024 * 1024,
    });
    if (!stdout.trim()) throw Error("PDF needs visual/OCR review");
    return stdout;
  } catch (error) {
    if (error.code === "ENOENT") throw Error("Install Poppler pdftotext to inspect this PDF");
    throw error;
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

export function createSourceReader({
  directory,
  offline = false,
  maxRequests = 1500,
  ttlHours = 24,
  signal,
  now = () => new Date(),
  resolve = lookup,
} = {}) {
  const inflight = new Map(),
    robots = new Map(),
    hosts = new Map();
  const stats = { networkRequests: 0, cacheHits: 0, importedCaptures: 0 };
  async function request(url, delay = 1) {
    const target = new URL(publicUrl(url));
    const previous = hosts.get(target.hostname) ?? Promise.resolve();
    const current = previous
      .catch(() => {})
      .then(async () => {
        signal?.throwIfAborted();
        if (stats.networkRequests >= maxRequests)
          throw Error("Request budget exhausted; resume with a larger budget");
        const addresses = await resolve(target.hostname, { all: true, verbatim: true });
        if (!addresses.length || addresses.some((a) => !publicAddress(a.address)))
          throw Error("Source DNS includes a non-public address");
        const answer = addresses[0];
        if (stats.networkRequests >= maxRequests)
          throw Error("Request budget exhausted; resume with a larger budget");
        stats.networkRequests++;
        const result = await new Promise((accept, reject) => {
          const req = https.get(
            target,
            {
              signal,
              agent: false,
              headers: {
                "User-Agent": AGENT,
                Accept: "text/html,application/pdf,text/plain",
                "Accept-Encoding": "identity",
              },
              lookup: (_host, options, done) =>
                options.all ? done(null, [answer]) : done(null, answer.address, answer.family),
            },
            (res) => {
              let size = 0;
              const chunks = [];
              res.on("data", (chunk) => {
                size += chunk.length;
                if (size > 6 * 1024 * 1024) {
                  req.destroy(Error("Source exceeds 6 MiB limit"));
                  return;
                }
                chunks.push(chunk);
              });
              res.on("error", reject);
              res.on("end", () =>
                accept({
                  status: res.statusCode,
                  headers: res.headers,
                  body: Buffer.concat(chunks),
                }),
              );
            },
          );
          const timer = setTimeout(() => req.destroy(Error("Source request timed out")), 12000);
          req.once("close", () => clearTimeout(timer));
          req.on("error", reject);
        });
        return result;
      });
    hosts.set(
      target.hostname,
      current.then(
        () => new Promise((r) => setTimeout(r, delay * 1000)),
        () => new Promise((r) => setTimeout(r, delay * 1000)),
      ),
    );
    return current;
  }
  async function crawlPolicy(url) {
    const target = new URL(url);
    if (!robots.has(target.origin))
      robots.set(
        target.origin,
        (async () => {
          let robotsUrl = `${target.origin}/robots.txt`;
          for (let i = 0; i < 5; i++) {
            const result = await request(robotsUrl);
            if ([301, 302, 303, 307, 308].includes(result.status) && result.headers.location) {
              robotsUrl = publicUrl(result.headers.location, robotsUrl);
              continue;
            }
            if ([404, 410].includes(result.status)) return "";
            if (result.status !== 200) throw Error(`Crawl rules HTTP ${result.status}`);
            return result.body.toString("utf8");
          }
          throw Error("Too many crawl-rule redirects");
        })(),
      );
    const policy = robotsPolicy(await robots.get(target.origin), target.pathname + target.search);
    if (!policy.allowed) throw Error("Source disallows automated reading");
    return policy;
  }
  async function read(url) {
    const path = join(directory, `${digest(url)}.json`);
    try {
      const cached = JSON.parse(await readFile(path, "utf8"));
      const age = now().getTime() - Date.parse(cached.checkedAt);
      const ttl = cached.status === 200 ? ttlHours : Math.min(ttlHours, 2);
      if (
        cached.url === url &&
        cached.textHash === digest(cached.text ?? "") &&
        age >= 0 &&
        (offline || age < ttl * 3600000)
      ) {
        stats.cacheHits++;
        if (cached.imported) stats.importedCaptures++;
        return {
          ...cached,
          unchecked:
            cached.unchecked ||
            /EAI_AGAIN|ENOTFOUND|ENETUNREACH|EHOSTUNREACH/.test(cached.error ?? ""),
          reusedCapture: true,
        };
      }
    } catch {
      /* A missing or invalid capture must not masquerade as a check. */
    }
    if (offline)
      return {
        url,
        status: 0,
        text: "",
        links: [],
        error: "No retained capture: not checked",
        unchecked: true,
      };
    const checkedAt = now().toISOString();
    let current = url;
    try {
      let result;
      for (let i = 0; i < 5; i++) {
        const policy = await crawlPolicy(current);
        result = await request(current, policy.delay);
        if ([301, 302, 303, 307, 308].includes(result.status) && result.headers.location) {
          current = publicUrl(result.headers.location, current);
          result = undefined;
          continue;
        }
        break;
      }
      if (!result) throw Error("Too many source redirects");
      if (result.status !== 200) throw Error(`Source HTTP ${result.status}`);
      const contentType = String(result.headers["content-type"] ?? "");
      let parsed;
      if (
        contentType.includes("application/pdf") ||
        result.body.subarray(0, 5).toString() === "%PDF-"
      )
        parsed = { title: "", text: await pdfText(result.body), links: [] };
      else if (/text\/html|application\/xhtml/.test(contentType))
        parsed = parseHtml(result.body.toString("utf8"), current);
      else if (contentType.includes("text/plain"))
        parsed = { title: "", text: result.body.toString("utf8"), links: [] };
      else throw Error(`Unsupported source format: ${contentType}`);
      const capture = {
        url,
        finalUrl: current,
        status: 200,
        checkedAt,
        ...parsed,
        textHash: digest(parsed.text),
      };
      await writeJson(path, capture);
      return capture;
    } catch (error) {
      const unchecked = /budget exhausted|abort|EAI_AGAIN|ENOTFOUND|ENETUNREACH|EHOSTUNREACH/i.test(
        error.message,
      );
      const capture = {
        url,
        finalUrl: current,
        status: 0,
        checkedAt,
        text: "",
        links: [],
        textHash: digest(""),
        error: error.message,
        unchecked,
      };
      // Limits/interruption are not failed source checks and must retry on resume.
      if (!unchecked) await writeJson(path, capture);
      return capture;
    }
  }
  return {
    stats,
    async read(value) {
      let url;
      try {
        url = publicUrl(value);
      } catch (error) {
        return {
          url: value,
          status: 0,
          text: "",
          links: [],
          error: error.message,
          unchecked: true,
        };
      }
      await mkdir(directory, { recursive: true, mode: 0o700 });
      if (!inflight.has(url)) inflight.set(url, read(url));
      return inflight.get(url);
    },
  };
}
