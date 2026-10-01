import { test, expect } from "@playwright/test";

test("public home is edge-cacheable and tagged", async ({ request }) => {
  const res = await request.get("/");
  expect(res.status()).toBe(200);
  expect(res.headers()["cdn-cache-control"]).toBe("max-age=60");
  expect(res.headers()["cache-control"]).toBe("public, max-age=0, must-revalidate");
});

test("draft-mode requests are never cacheable", async ({ request }) => {
  const res = await request.get("/", { headers: { cookie: "__prerender_bypass=x" } });
  expect(res.headers()["cache-control"]).toBe("private, no-store");
  expect(res.headers()["cdn-cache-control"]).toBeUndefined();
});

test("api routes are never edge-cacheable", async ({ request }) => {
  const res = await request.get("/api/draft-mode/enable");
  expect(res.status()).toBe(401);
  expect(res.headers()["cdn-cache-control"]).toBeUndefined();
});

test("beds24 api route is never edge-cacheable", async ({ request }) => {
  const res = await request.get("/api/beds24");
  expect(res.status()).toBe(401);
  expect(res.headers()["cdn-cache-control"]).toBeUndefined();
  expect(res.headers()["cache-control"]).toBe("private, no-store");
});
