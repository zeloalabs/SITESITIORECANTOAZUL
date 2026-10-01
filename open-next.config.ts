import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Cache mínimo: sem overrides (sem R2, D1 ou Durable Objects). Ver docs/infra-medicoes.md.
export default defineCloudflareConfig();
