import assert from "node:assert/strict";
import { chromium } from "playwright";
import { checkedUrl } from "./browser-guard.mjs";

const base = checkedUrl(process.argv[2] || "http://127.0.0.1:8080");
const browser = await chromium.launch();
try {
  for (const width of [320, 375, 768, 1280]) {
    const page = await browser.newPage({ viewport: { width, height: 844 } });
    page.setDefaultTimeout(30_000);
    const slug = width === 320 || width === 768
      ? "dublin-marathon-2026-results-national-champions"
      : "auckland-marathon-2026-results-gualter-dennehy";
    const country = slug.startsWith("dublin") ? "Ireland" : "New Zealand";
    await page.goto(`${base}/news?level=local`, { waitUntil: "networkidle" });
    await page.locator("[aria-labelledby='country-stories-heading']").getByRole("link", { name: country, exact: true }).click();
    const path = `/news/${slug}`;
    await page.locator(`h2 a[href="${path}"]`).waitFor();
    await page.getByRole("navigation", { name: "Stories", exact: true })
      .getByRole("link", { name: "Race Reports", exact: true }).click();
    await page.waitForURL((url) => url.pathname === "/race-reports" && url.searchParams.get("country") === country);
    const story = page.locator(`h2 a[href="${path}"]`);
    await story.click();
    await page.waitForURL((url) => url.pathname === path && !url.search);
    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    assert.equal(canonical, `https://www.athrecs.com${path}`);
    const graph = await page.locator('script[type="application/ld+json"]').evaluateAll((scripts) =>
      scripts.flatMap((script) => JSON.parse(script.textContent)["@graph"] ?? []),
    );
    assert.equal(graph.find((item) => item["@type"] === "Article")?.url, canonical);
    assert.ok(graph.some((item) => item["@type"] === "BreadcrumbList"));
    const article = page.locator("main article").first();
    const bounds = await article.boundingBox();
    assert.ok(bounds && bounds.x >= 0 && bounds.x + bounds.width <= width + 1, `Article exceeds ${width}px`);
    const table = article.getByRole("table").first().locator("..");
    assert.equal(await table.getAttribute("role"), "region");
    assert.equal(await table.getAttribute("tabindex"), "0");
    await table.focus();
    const sizes = await table.evaluate((element) => {
      element.scrollLeft = element.scrollWidth;
      return [element.clientWidth, element.scrollWidth, element.scrollLeft];
    });
    assert.ok(sizes[0] <= width);
    if (width < 512) {
      assert.ok(
        sizes[1] > sizes[0] && sizes[2] > 0,
        `Table must scroll at ${width}px (client, content, scroll offset: ${sizes.join(", ")})`,
      );
    }
    await page.close();
    console.log(`${country}: same canonical from both desks; article and table checked at ${width}px`);
  }
} finally {
  await browser.close();
}
