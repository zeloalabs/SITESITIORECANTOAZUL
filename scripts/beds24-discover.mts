import { writeFileSync, mkdirSync } from "node:fs";

const token = process.env.BEDS24_TOKEN;
if (!token) {
  console.error("BEDS24_TOKEN ausente");
  process.exit(1);
}

const res = await fetch("https://api.beds24.com/v2/properties?includeAllRooms=true", {
  headers: { token, accept: "application/json" },
});

console.error(`status=${res.status} remaining=${res.headers.get("x-five-min-limit-remaining")} cost=${res.headers.get("x-request-cost")}`);

if (!res.ok) {
  const text = await res.text();
  console.error("Erro na API Beds24:", res.status, text);
  process.exit(1);
}

const body = (await res.json()) as { success?: boolean; data?: Record<string, unknown>[] };

if (!body.data || !Array.isArray(body.data)) {
  console.error("Resposta inesperada da Beds24:", JSON.stringify(body));
  process.exit(1);
}

// Inspecionar formato do primeiro property e seus quartos para validação de formato
const firstProperty = body.data[0];
if (firstProperty) {
  console.error("Property keys:", Object.keys(firstProperty));
  const rawRooms = (firstProperty.roomTypes ?? firstProperty.rooms) as Record<string, unknown>[] | undefined;
  if (rawRooms && rawRooms[0]) {
    console.error("Room keys:", Object.keys(rawRooms[0]));
  }
}

const sanitized = {
  success: body.success,
  data: (body.data ?? []).map((p: Record<string, unknown>) => {
    const rawRooms = ((p.roomTypes ?? p.rooms) as Record<string, unknown>[]) ?? [];
    return {
      id: p.id,
      name: p.name,
      roomTypes: rawRooms.map((r) => ({
        id: r.id,
        name: r.name,
        maxPeople: r.maxPeople ?? r.maxOccupancy ?? null,
      })),
    };
  }),
};

mkdirSync("src/lib/beds24/__fixtures__", { recursive: true });
writeFileSync("src/lib/beds24/__fixtures__/properties.json", JSON.stringify(sanitized, null, 2) + "\n");

console.log("=== DESCOBERTA BEDS24 ===");
for (const p of sanitized.data) {
  console.log(`property ${p.id} — ${p.name}`);
  for (const r of p.roomTypes) {
    console.log(`  room ${r.id} — ${r.name} (max ${r.maxPeople ?? "?"})`);
  }
}
