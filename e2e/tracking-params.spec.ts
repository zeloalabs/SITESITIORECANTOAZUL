import { test, expect } from "@playwright/test";

test("tracking params never reach the rendered HTML", async ({ request }) => {
  const res = await request.get("/?utm_source=VISITANTE_A&gclid=GCLID_A&fbclid=FBCLID_A");
  expect(res.status()).toBe(200);
  expect(res.headers()["cdn-cache-control"]).toBe("max-age=60");
  const html = await res.text();
  for (const leaked of ["VISITANTE_A", "GCLID_A", "FBCLID_A", "utm_source"]) expect(html).not.toContain(leaked);
});

test("unknown query params bypass the public cache", async ({ request }) => {
  const res = await request.get("/?utm_source=ig&q=1");
  expect(res.headers()["cache-control"]).toBe("private, no-store");
  expect(res.headers()["cdn-cache-control"]).toBeUndefined();
});

test(".rsc paths bypass the public cache", async ({ request }) => {
  const res = await request.get("/index.rsc");
  expect(res.headers()["cdn-cache-control"]).toBeUndefined();
});

function collectHydrationErrors(page: import("@playwright/test").Page) {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(err.message));
  return () => errors.filter((e) => /hydrat/i.test(e));
}

// Páginas cacheadas: o render nunca vê `utm_*`/`gclid`/`fbclid`, então `useSearchParams` também não.
// Analytics/rastreio devem ler `window.location`. A URL do navegador continua intacta.
test("cached page: browser keeps tracking params, useSearchParams does not see them, no hydration errors", async ({ page }) => {
  const hydrationErrors = collectHydrationErrors(page);
  await page.goto("/e2e/search-params?utm_source=ig&fbclid=abc");
  const probe = page.getByTestId("search-params");
  await expect(probe).toHaveAttribute("data-hydrated", "yes");
  await expect(probe).toHaveText("");
  expect(new URL(page.url()).search).toBe("?utm_source=ig&fbclid=abc");
  expect(await page.evaluate(() => window.location.search)).toBe("?utm_source=ig&fbclid=abc");
  expect(hydrationErrors()).toEqual([]);
});

test("bypass page: useSearchParams sees every param, no hydration errors", async ({ page }) => {
  const hydrationErrors = collectHydrationErrors(page);
  await page.goto("/e2e/search-params?q=1&utm_source=ig");
  const probe = page.getByTestId("search-params");
  await expect(probe).toHaveAttribute("data-hydrated", "yes");
  await expect(probe).toHaveText("q=1&utm_source=ig");
  expect(hydrationErrors()).toEqual([]);
});
