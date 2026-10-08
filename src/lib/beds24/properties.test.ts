// @vitest-environment node
import { describe, it, expect, vi } from "vitest";
import fixture from "./__fixtures__/properties.json";
import { getPropertyRooms } from "./properties";
import type { Beds24Client } from "./client";

describe("getPropertyRooms", () => {
  it("maps the real /properties response into property and room ids", async () => {
    const client: Beds24Client = { get: vi.fn(async () => ({ ok: true as const, data: fixture.data })) } as unknown as Beds24Client;
    const result = await getPropertyRooms(client);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.length).toBeGreaterThan(0);
    for (const property of result.data) {
      expect(Number.isInteger(property.propertyId)).toBe(true);
      for (const room of property.rooms) {
        expect(Number.isInteger(room.roomId)).toBe(true);
        expect(room.name.length).toBeGreaterThan(0);
      }
    }
    expect(client.get).toHaveBeenCalledWith("/properties", { includeAllRooms: true });
  });

  it("passes errors through unchanged", async () => {
    const client = { get: vi.fn(async () => ({ ok: false as const, error: "auth" as const })) } as unknown as Beds24Client;
    expect(await getPropertyRooms(client)).toEqual({ ok: false, error: "auth" });
  });
});
