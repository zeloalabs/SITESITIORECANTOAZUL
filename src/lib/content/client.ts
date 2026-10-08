import { createClient } from "next-sanity";
import { defineLive } from "next-sanity/live";
import { sanityDataset, sanityProjectId } from "@/lib/sanity-config";

export const client = createClient({
  projectId: sanityProjectId,
  dataset: sanityDataset,
  apiVersion: "2026-10-01",
  useCdn: true,
  stega: { studioUrl: process.env.NEXT_PUBLIC_SANITY_STUDIO_URL ?? "https://sitiorecantoazul.sanity.studio" },
});

export const { sanityFetch, SanityLive } = defineLive({
  client,
  serverToken: process.env.SANITY_API_READ_TOKEN,
  browserToken: process.env.SANITY_API_BROWSER_TOKEN,
});
