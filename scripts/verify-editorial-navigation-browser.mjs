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
    const board = article.locator("section[data-standings]").first();
    const panels = board.locator("details");
    assert.deepEqual(await panels.locator("summary").allTextContents(), ["Men", "Women"]);
    const [men, women] = await Promise.all([panels.nth(0).boundingBox(), panels.nth(1).boundingBox()]);
    assert.ok(men && women);
    if (width >= 768) assert.ok(women.x >= men.x + men.width, "Men on the left and women on the right");
    else assert.ok(women.y >= men.y + men.height, "Stack divisions on phones");
    for (const panel of await panels.all()) {
      assert.ok(await panel.getByRole("table").isVisible());
      assert.ok(await panel.evaluate(el => el.scrollWidth <= el.clientWidth + 1), "Panel fits the viewport");
    }
    const summary = panels.first().locator("summary");
    await summary.focus();
    await summary.press("Enter");
    assert.equal(await panels.first().getByRole("table").isVisible(), false);
    assert.ok(await panels.nth(1).getByRole("table").isVisible());
    await summary.press("Enter");
    assert.ok(await panels.first().getByRole("table").isVisible());
    await page.close();
    console.log(`${country}: same canonical from both desks; article and table checked at ${width}px`);
  }
} finally {
  await browser.close();
}
