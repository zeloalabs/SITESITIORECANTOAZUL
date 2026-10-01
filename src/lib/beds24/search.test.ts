// @vitest-environment node
import { describe, it, expect } from "vitest";
import { parseSearch, todayInSaoPaulo } from "./search";

const q = (s: string) => new URLSearchParams(s);
const TODAY = "2026-10-01";

describe("todayInSaoPaulo", () => {
  it("uses São Paulo date at 23:30 local even though UTC is already the next day", () => {
    // 2026-10-02T02:30Z = 2026-10-01 23:30 em SP (UTC-3)
    expect(todayInSaoPaulo(new Date("2026-10-02T02:30:00Z"))).toBe("2026-10-01");
  });
});

describe("parseSearch", () => {
  it("parses a valid stay and computes nights", () => {
    expect(parseSearch(q("checkin=2026-10-01&checkout=2026-10-03&adultos=2&criancas=1"), TODAY)).toEqual({
      ok: true,
      stay: { checkin: "2026-10-01", checkout: "2026-10-03", nights: 2, adults: 2, children: 1 },
    });
  });

  it("defaults children to 0", () => {
    const r = parseSearch(q("checkin=2026-10-05&checkout=2026-10-06&adultos=2"), TODAY);
    expect(r.ok && r.stay.children).toBe(0);
  });

  it("accepts check-in today", () => {
    expect(parseSearch(q("checkin=2026-10-01&checkout=2026-10-02&adultos=1"), TODAY).ok).toBe(true);
  });

  it("rejects check-in in the past", () => {
    expect(parseSearch(q("checkin=2026-09-30&checkout=2026-10-02&adultos=2"), TODAY)).toEqual({ ok: false, error: "checkin_in_past" });
  });

  it("rejects checkout equal to or before check-in", () => {
    expect(parseSearch(q("checkin=2026-10-05&checkout=2026-10-05&adultos=2"), TODAY)).toEqual({ ok: false, error: "checkout_not_after_checkin" });
  });

  it("rejects more than 30 nights", () => {
    expect(parseSearch(q("checkin=2026-10-01&checkout=2026-11-01&adultos=2"), TODAY)).toEqual({ ok: false, error: "too_many_nights" });
    expect(parseSearch(q("checkin=2026-10-01&checkout=2026-10-31&adultos=2"), TODAY).ok).toBe(true);
  });

  it("rejects impossible or malformed dates", () => {
    expect(parseSearch(q("checkin=2026-02-30&checkout=2026-03-02&adultos=2"), TODAY)).toEqual({ ok: false, error: "invalid_date" });
    expect(parseSearch(q("checkin=01/10/2026&checkout=2026-10-03&adultos=2"), TODAY)).toEqual({ ok: false, error: "invalid_date" });
    expect(parseSearch(q("adultos=2"), TODAY)).toEqual({ ok: false, error: "invalid_date" });
  });

  it("rejects guest counts out of range", () => {
    const base = "checkin=2026-10-05&checkout=2026-10-07";
    expect(parseSearch(q(`${base}&adultos=0`), TODAY)).toEqual({ ok: false, error: "invalid_guests" });
    expect(parseSearch(q(`${base}&adultos=21`), TODAY)).toEqual({ ok: false, error: "invalid_guests" });
    expect(parseSearch(q(`${base}&adultos=2&criancas=11`), TODAY)).toEqual({ ok: false, error: "invalid_guests" });
    expect(parseSearch(q(`${base}&adultos=15&criancas=6`), TODAY)).toEqual({ ok: false, error: "invalid_guests" });
    expect(parseSearch(q(`${base}&adultos=2.5`), TODAY)).toEqual({ ok: false, error: "invalid_guests" });
    expect(parseSearch(q(`${base}&adultos=20`), TODAY).ok).toBe(true);
  });
});
