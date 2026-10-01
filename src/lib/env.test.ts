// @vitest-environment node
import { describe, it, expect } from "vitest";
import { readServerEnv } from "./env";

describe("readServerEnv", () => {
  it("returns nulls and prices disabled when vars are missing", () => {
    expect(readServerEnv({})).toEqual({
      beds24Token: null,
      sanityReadToken: null,
      pricesEnabled: false,
    });
  });

  it("enables prices only for the exact string 'true'", () => {
    expect(readServerEnv({ PRICES_ENABLED: "true" }).pricesEnabled).toBe(true);
    expect(readServerEnv({ PRICES_ENABLED: "1" }).pricesEnabled).toBe(false);
    expect(readServerEnv({ PRICES_ENABLED: "TRUE" }).pricesEnabled).toBe(false);
  });

  it("treats blank tokens as missing", () => {
    expect(readServerEnv({ BEDS24_TOKEN: "  " }).beds24Token).toBeNull();
  });
});
