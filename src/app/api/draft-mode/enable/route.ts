import { defineEnableDraftMode } from "next-sanity/draft-mode";
import { client } from "@/lib/content/live";

export const { GET } = defineEnableDraftMode({
  client: client.withConfig({ token: process.env.SANITY_API_READ_TOKEN }),
});
