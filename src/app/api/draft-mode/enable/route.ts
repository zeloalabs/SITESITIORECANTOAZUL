import { defineEnableDraftMode } from "next-sanity/draft-mode";
import { client } from "@/lib/content/client";
import { enableDraftModeGate } from "@/lib/draft-mode";

export async function GET(request: Request): Promise<Response> {
  const token = process.env.SANITY_API_READ_TOKEN;
  return enableDraftModeGate(request, token, (req) => defineEnableDraftMode({ client: client.withConfig({ token }) }).GET(req));
}
