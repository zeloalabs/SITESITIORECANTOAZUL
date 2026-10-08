// @vitest-environment node
import { describe, it, expect, vi } from "vitest";
import { createBeds24Client } from "./client";
import { CreditBreaker, MemoryBreakerStore } from "./breaker";

function okResponse(body: unknown, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json", "x-five-min-limit-remaining": "90", "x-five-min-limit-resets-in": "200", "x-request-cost": "1", ...extra },
  });
}

function makeClient(fetchImpl: typeof fetch, token: string | null = "tkn", log = vi.fn()) {
  const breaker = new CreditBreaker(new MemoryBreakerStore(), () => 0);
  return { client: createBeds24Client({ token, breaker, fetchImpl, timeoutMs: 50, log }), breaker, log };
}

describe("beds24 client", () => {
  it("sends the token header and query params, returns data", async () => {
    const fetchImpl = vi.fn(async () => okResponse({ success: true, data: [{ id: 1 }] }));
    const { client } = makeClient(fetchImpl as unknown as typeof fetch);
    const result = await client.get<{ id: number }[]>("/properties", { includeAllRooms: true, id: [10, 20] });
    expect(result).toEqual({ ok: true, data: [{ id: 1 }] });
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.beds24.com/v2/properties?includeAllRooms=true&id=10&id=20");
    expect(new Headers(init.headers).get("token")).toBe("tkn");
  });

  it("returns auth without calling the API when the token is missing", async () => {
    const fetchImpl = vi.fn();
    const { client } = makeClient(fetchImpl as unknown as typeof fetch, null);
    expect(await client.get("/properties", {})).toEqual({ ok: false, error: "auth" });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("maps 401/403 to auth", async () => {
    const fetchImpl = vi.fn(async () => new Response("{}", { status: 401 }));
    const { client } = makeClient(fetchImpl as unknown as typeof fetch);
    expect(await client.get("/properties", {})).toEqual({ ok: false, error: "auth" });
  });

  it("maps 429 to rate_limited and opens the breaker", async () => {
    const fetchImpl = vi.fn(async () => new Response("{}", { status: 429, headers: { "x-five-min-limit-resets-in": "60" } }));
    const { client, breaker } = makeClient(fetchImpl as unknown as typeof fetch);
    expect(await client.get("/properties", {})).toEqual({ ok: false, error: "rate_limited" });
    expect(await breaker.isOpen()).toBe(true);
  });

  it("returns breaker_open without calling the API once credits drop below 20", async () => {
    const fetchImpl = vi.fn(async () => okResponse({ success: true, data: [] }, { "x-five-min-limit-remaining": "15" }));
    const { client } = makeClient(fetchImpl as unknown as typeof fetch);
    await client.get("/properties", {});
    expect(await client.get("/properties", {})).toEqual({ ok: false, error: "breaker_open" });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("treats success:false with HTTP 200 as api_error, not empty data", async () => {
    const fetchImpl = vi.fn(async () => okResponse({ success: false, error: "something" }));
    const { client } = makeClient(fetchImpl as unknown as typeof fetch);
    expect(await client.get("/inventory/rooms/offers", {})).toEqual({ ok: false, error: "api_error" });
  });

  it("returns timeout when the API is slower than timeoutMs", async () => {
    const fetchImpl = vi.fn((_url: string, init: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        init.signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")));
      }),
    );
    const { client } = makeClient(fetchImpl as unknown as typeof fetch);
    expect(await client.get("/properties", {})).toEqual({ ok: false, error: "timeout" });
  });

  it("returns network on fetch failure", async () => {
    const fetchImpl = vi.fn(async () => { throw new TypeError("fetch failed"); });
    const { client } = makeClient(fetchImpl as unknown as typeof fetch);
    expect(await client.get("/properties", {})).toEqual({ ok: false, error: "network" });
  });

  it("never logs the token or query values", async () => {
    const fetchImpl = vi.fn(async () => okResponse({ success: true, data: [] }));
    const { client, log } = makeClient(fetchImpl as unknown as typeof fetch);
    await client.get("/inventory/rooms/offers", { arrival: "2026-12-01", numAdults: 2 });
    expect(log).toHaveBeenCalledWith({ path: "/inventory/rooms/offers", status: 200, cost: 1 });
    expect(JSON.stringify(log.mock.calls)).not.toContain("tkn");
    expect(JSON.stringify(log.mock.calls)).not.toContain("2026-12-01");
  });
});
