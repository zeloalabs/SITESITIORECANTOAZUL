// Entrada do Worker. Gateway (default, sem Workers Cache) + `PublicPages` (com Workers Cache).
//
// - Páginas públicas iguais para todos → `ctx.exports.PublicPages` (cache na borda, TTL 60 s, tag `public-pages`).
//   Em HIT o Worker nem roda.
// - Draft Mode, Presentation, `/api/*` (draft, webhook, Beds24) e qualquer request personalizado → vinext direto,
//   sem cache, com `Cache-Control: private, no-store` quando for página.
// - `POST /api/sanity-webhook` (assinado) → purge da tag pública via RPC no `PublicPages`
//   (o purge é por entrypoint, então precisa rodar dentro dele).
import { WorkerEntrypoint } from "cloudflare:workers";
import vinext from "vinext/server/fetch-handler";
import { isPublicCacheable, withPrivateNoStore, withPublicCacheHeaders, PUBLIC_CACHE_TAG } from "./cache-policy";
import { handleSanityWebhook, SANITY_WEBHOOK_PATH } from "./sanity-webhook";

type WorkerEnv = Env & { SANITY_WEBHOOK_SECRET?: string };
type VinextHandler = { fetch(request: Request, env: unknown, ctx: ExecutionContext): Promise<Response> };
type PublicPagesStub = { fetch(request: Request): Promise<Response>; purgePublicCache(): Promise<void> };

const handler = vinext as unknown as VinextHandler;

export class PublicPages extends WorkerEntrypoint<WorkerEnv> {
  async fetch(request: Request): Promise<Response> {
    return withPublicCacheHeaders(await handler.fetch(request, this.env, this.ctx));
  }

  async purgePublicCache(): Promise<void> {
    if (!this.ctx.cache) throw new Error("Workers Cache indisponível");
    await this.ctx.cache.purge({ tags: [PUBLIC_CACHE_TAG] });
  }
}

export default {
  async fetch(request: Request, env: WorkerEnv, ctx: ExecutionContext): Promise<Response> {
    const publicPages = (ctx.exports as unknown as { PublicPages: PublicPagesStub }).PublicPages;
    const { pathname } = new URL(request.url);

    if (pathname === SANITY_WEBHOOK_PATH) {
      return handleSanityWebhook(request, env.SANITY_WEBHOOK_SECRET, () => publicPages.purgePublicCache());
    }

    if (isPublicCacheable(request)) return publicPages.fetch(request);

    const response = await handler.fetch(request, env, ctx);
    if (pathname === "/api" || pathname.startsWith("/api/")) return response;
    return withPrivateNoStore(response);
  },
} satisfies ExportedHandler<WorkerEnv>;
