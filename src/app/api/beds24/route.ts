import "server-only";
import { getBeds24Client } from "@/lib/beds24/client";

export const dynamic = "force-dynamic";

export async function GET() {
  const client = getBeds24Client();
  const result = await client.get("/properties", {});

  const status = result.ok
    ? 200
    : result.error === "auth"
      ? 401
      : result.error === "rate_limited"
        ? 429
        : 502;

  return Response.json(result, {
    status,
    headers: {
      "cache-control": "private, no-store",
    },
  });
}
