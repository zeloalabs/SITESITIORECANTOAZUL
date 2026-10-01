// @vitest-environment node
import { describe, it, expect } from "vitest";
import { isPublicCacheable, toPublicCacheRequest, withPublicCacheHeaders, withPrivateNoStore, PUBLIC_CACHE_TAG } from "./cache-policy";

const req = (path: string, init: RequestInit = {}) => new Request(`https://example.test${path}`, init);

describe("isPublicCacheable", () => {
  it("accepts anonymous GET and HEAD for pages", () => {
    expect(isPublicCacheable(req("/"))).toBe(true);
    expect(isPublicCacheable(req("/acomodacoes", { method: "HEAD" }))).toBe(true);
  });

  it("rejects other methods", () => {
    expect(isPublicCacheable(req("/", { method: "POST" }))).toBe(false);
  });

  it("never caches /api routes (draft mode, webhooks, Beds24)", () => {
    expect(isPublicCacheable(req("/api/draft-mode/enable"))).toBe(false);
    expect(isPublicCacheable(req("/api/beds24/search"))).toBe(false);
    expect(isPublicCacheable(req("/api"))).toBe(false);
  });

  it("never caches requests carrying draft-mode or preview cookies", () => {
    expect(isPublicCacheable(req("/", { headers: { cookie: "__prerender_bypass=abc" } }))).toBe(false);
    expect(isPublicCacheable(req("/", { headers: { cookie: "x=1; sanity-preview-perspective=drafts" } }))).toBe(false);
  });

  it("ignores unrelated cookies", () => {
    expect(isPublicCacheable(req("/", { headers: { cookie: "_ga=1" } }))).toBe(true);
  });

  it("never caches authorized or RSC navigation requests", () => {
    expect(isPublicCacheable(req("/", { headers: { authorization: "Bearer x" } }))).toBe(false);
    expect(isPublicCacheable(req("/", { headers: { rsc: "1" } }))).toBe(false);
    expect(isPublicCacheable(req("/?_rsc=abc"))).toBe(false);
  });

  it("never caches .rsc payload paths", () => {
    expect(isPublicCacheable(req("/index.rsc"))).toBe(false);
    expect(isPublicCacheable(req("/acomodacoes.rsc"))).toBe(false);
  });

  it("bypasses the cache for any non-tracking query parameter", () => {
    expect(isPublicCacheable(req("/?q=1"))).toBe(false);
    expect(isPublicCacheable(req("/?utm_source=ig&checkin=2026-12-01"))).toBe(false);
  });

  it("accepts URLs whose only parameters are tracking parameters", () => {
    expect(isPublicCacheable(req("/?utm_source=ig&utm_campaign=x&gclid=1&fbclid=2"))).toBe(true);
  });
});

describe("toPublicCacheRequest", () => {
  it("strips utm_*, gclid and fbclid so they never reach the render or the cache key", () => {
    const out = toPublicCacheRequest(req("/acomodacoes?utm_source=ig&utm_medium=bio&gclid=G&fbclid=F"));
    expect(out).not.toBeNull();
    expect(out!.url).toBe("https://example.test/acomodacoes");
  });

  it("keeps method and headers", () => {
    const out = toPublicCacheRequest(req("/?fbclid=F", { method: "HEAD", headers: { "accept-language": "pt-BR" } }));
    expect(out!.method).toBe("HEAD");
    expect(out!.headers.get("accept-language")).toBe("pt-BR");
  });

  it("returns the same URL when there is nothing to strip", () => {
    expect(toPublicCacheRequest(req("/"))!.url).toBe("https://example.test/");
  });

  it("returns null for non-cacheable requests", () => {
    expect(toPublicCacheRequest(req("/?q=1"))).toBeNull();
    expect(toPublicCacheRequest(req("/api/x"))).toBeNull();
    expect(toPublicCacheRequest(req("/", { headers: { cookie: "__prerender_bypass=1" } }))).toBeNull();
  });
});

describe("withPublicCacheHeaders", () => {
  it("marks 200 responses cacheable at the edge for 60s and tags them", () => {
    const res = withPublicCacheHeaders(new Response("ok", { headers: { "cache-control": "private, no-store" } }));
    expect(res.headers.get("cdn-cache-control")).toBe("max-age=60");
    expect(res.headers.get("cache-control")).toBe("public, max-age=0, must-revalidate");
    expect(res.headers.get("cache-tag")).toBe(PUBLIC_CACHE_TAG);
  });

  it("does not cache non-200 responses", () => {
    const res = withPublicCacheHeaders(new Response("nope", { status: 404 }));
    expect(res.headers.get("cache-control")).toBe("private, no-store");
    expect(res.headers.get("cdn-cache-control")).toBeNull();
  });

  it("does not cache responses that set cookies", () => {
    const res = withPublicCacheHeaders(new Response("ok", { headers: { "set-cookie": "a=1" } }));
    expect(res.headers.get("cache-control")).toBe("private, no-store");
    expect(res.headers.get("cache-tag")).toBeNull();
  });
});

describe("withPrivateNoStore", () => {
  it("forces private, no-store and drops edge cache headers", () => {
    const res = withPrivateNoStore(
      new Response("draft", { headers: { "cache-control": "public, max-age=60", "cdn-cache-control": "max-age=60" } }),
    );
    expect(res.headers.get("cache-control")).toBe("private, no-store");
    expect(res.headers.get("cdn-cache-control")).toBeNull();
  });
});
