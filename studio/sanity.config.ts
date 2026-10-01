import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { presentationTool } from "sanity/presentation";
import { schemaTypes } from "./schemas";

export default defineConfig({
  name: "default",
  title: "Sítio Recanto Azul",
  projectId: "bwn70x6z",
  dataset: "production",
  plugins: [
    structureTool(),
    presentationTool({
      previewUrl: {
        initial: process.env.SANITY_STUDIO_PREVIEW_URL ?? "http://localhost:3001",
        previewMode: { enable: "/api/draft-mode/enable" },
      },
    }),
  ],
  schema: { types: schemaTypes },
});
