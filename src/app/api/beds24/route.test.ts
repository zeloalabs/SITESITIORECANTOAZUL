// @vitest-environment node
import { describe, it, expect, beforeEach } from "vitest";
import { GET } from "./route";

describe("GET /api/beds24", () => {
  beforeEach(() => {
    delete process.env.BEDS24_TOKEN;
  });

  it("returns 401 with auth error and private cache-control when token is not configured", async () => {
    const res = await GET();
    expect(res.status).toBe(401);
    expect(res.headers.get("cache-control")).toBe("private, no-store");
    const json = await res.json();
    expect(json).toEqual({ ok: false, error: "auth" });
  });
});
