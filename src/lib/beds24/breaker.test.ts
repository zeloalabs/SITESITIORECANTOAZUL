// @vitest-environment node
import { describe, it, expect } from "vitest";
import { CreditBreaker, MemoryBreakerStore, CREDIT_RESERVE } from "./breaker";

function headers(remaining: number, resetsIn: number) {
  return new Headers({
    "x-five-min-limit-remaining": String(remaining),
    "x-five-min-limit-resets-in": String(resetsIn),
  });
}

describe("CreditBreaker", () => {
  it("starts closed", async () => {
    const breaker = new CreditBreaker(new MemoryBreakerStore(), () => 0);
    expect(await breaker.isOpen()).toBe(false);
  });

  it("stays closed with exactly 20 credits remaining", async () => {
    expect(CREDIT_RESERVE).toBe(20);
    const breaker = new CreditBreaker(new MemoryBreakerStore(), () => 0);
    await breaker.record(headers(20, 120), 200);
    expect(await breaker.isOpen()).toBe(false);
  });

  it("opens with 19 or fewer credits remaining, even without a 429", async () => {
    const breaker = new CreditBreaker(new MemoryBreakerStore(), () => 0);
    await breaker.record(headers(19, 120), 200);
    expect(await breaker.isOpen()).toBe(true);
  });

  it("opens on 429 and respects resets-in, then closes", async () => {
    let now = 0;
    const breaker = new CreditBreaker(new MemoryBreakerStore(), () => now);
    await breaker.record(headers(0, 90), 429);
    expect(await breaker.isOpen()).toBe(true);
    now = 89_999;
    expect(await breaker.isOpen()).toBe(true);
    now = 90_000;
    expect(await breaker.isOpen()).toBe(false);
  });

  it("falls back to 5 minutes when resets-in is missing", async () => {
    let now = 0;
    const breaker = new CreditBreaker(new MemoryBreakerStore(), () => now);
    await breaker.record(new Headers(), 429);
    now = 299_999;
    expect(await breaker.isOpen()).toBe(true);
    now = 300_000;
    expect(await breaker.isOpen()).toBe(false);
  });

  it("persists only when the open state changes", async () => {
    const store = new MemoryBreakerStore();
    let saves = 0;
    const original = store.save.bind(store);
    store.save = async (s) => { saves++; return original(s); };
    const breaker = new CreditBreaker(store, () => 0);
    await breaker.record(headers(80, 120), 200);
    await breaker.record(headers(70, 110), 200);
    expect(saves).toBe(0);
    await breaker.record(headers(10, 100), 200);
    await breaker.record(headers(5, 90), 200);
    expect(saves).toBe(1);
  });

  it("shares an open breaker through the store across instances", async () => {
    const store = new MemoryBreakerStore();
    const a = new CreditBreaker(store, () => 0);
    await a.record(headers(5, 60), 200);
    const b = new CreditBreaker(store, () => 1_000);
    expect(await b.isOpen()).toBe(true);
  });

  it("ignores malformed headers on a 200", async () => {
    const breaker = new CreditBreaker(new MemoryBreakerStore(), () => 0);
    await breaker.record(new Headers({ "x-five-min-limit-remaining": "abc" }), 200);
    expect(await breaker.isOpen()).toBe(false);
  });
});
