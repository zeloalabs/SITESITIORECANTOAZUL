import "server-only";
import type { Beds24Client } from "./client";
import type { Beds24Result } from "./types";

type RawRoom = { id: number; name?: string; maxPeople?: number | null };
type RawProperty = { id: number; name?: string; roomTypes?: RawRoom[] };

export type PropertyRooms = {
  propertyId: number;
  propertyName: string;
  rooms: Array<{ roomId: number; name: string; maxPeople: number | null }>;
};

export async function getPropertyRooms(client: Beds24Client): Promise<Beds24Result<PropertyRooms[]>> {
  const result = await client.get<RawProperty[]>("/properties", { includeAllRooms: true });
  if (!result.ok) return result;
  return {
    ok: true,
    data: result.data.map((p) => ({
      propertyId: p.id,
      propertyName: p.name ?? "",
      rooms: (p.roomTypes ?? []).map((r) => ({
        roomId: r.id,
        name: r.name ?? `room ${r.id}`,
        maxPeople: r.maxPeople ?? null,
      })),
    })),
  };
}
