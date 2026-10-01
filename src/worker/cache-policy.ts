// Regras do Workers Cache. O cache fica na frente do entrypoint `PublicPages`; o gateway
// (entrypoint default, sem cache) só encaminha para lá o que for igual para todo visitante.

export const PUBLIC_CACHE_TAG = "public-pages";
export const PUBLIC_EDGE_TTL_SECONDS = 60;

const DRAFT_COOKIES = ["__prerender_bypass", "sanity-preview-perspective"];

function hasDraftCookie(request: Request): boolean {
  const cookie = request.headers.get("cookie");
  if (!cookie) return false;
  return cookie.split(";").some((part) => DRAFT_COOKIES.includes(part.split("=")[0]!.trim()));
}

// Parâmetros de rastreio: removidos antes do render e da cache key (a URL do navegador não muda).
// Consequência: em página cacheada, `useSearchParams` não vê esses parâmetros. Analytics/rastreio leem
// `window.location`; parâmetro que a UI precisa não pode ser de rastreio (assim faz BYPASS).
function isTrackingParam(name: string): boolean {
  return name.startsWith("utm_") || name === "gclid" || name === "fbclid";
}

/**
 * Request para o `PublicPages`, sem parâmetros de rastreio, ou `null` se a requisição não pode usar o cache
 * público. Qualquer parâmetro que não seja de rastreio faz BYPASS: nunca compartilha entrada de cache.
 */
export function toPublicCacheRequest(request: Request): Request | null {
  if (request.method !== "GET" && request.method !== "HEAD") return null;
  const url = new URL(request.url);
  if (url.pathname === "/api" || url.pathname.startsWith("/api/")) return null;
  if (url.pathname.endsWith(".rsc") || request.headers.has("rsc")) return null;
  if (request.headers.has("authorization")) return null;
  if (hasDraftCookie(request)) return null;

  const names = [...new Set(url.searchParams.keys())];
  if (names.some((name) => !isTrackingParam(name))) return null;
  if (names.length === 0) return request;
  url.search = "";
  return new Request(url, request);
}

export function isPublicCacheable(request: Request): boolean {
  return toPublicCacheRequest(request) !== null;
}

export function withPrivateNoStore(response: Response): Response {
  const res = new Response(response.body, response);
  res.headers.set("cache-control", "private, no-store");
  res.headers.delete("cdn-cache-control");
  res.headers.delete("cloudflare-cdn-cache-control");
  res.headers.delete("cache-tag");
  return res;
}

export function withPublicCacheHeaders(response: Response): Response {
  if (response.status !== 200 || response.headers.has("set-cookie")) return withPrivateNoStore(response);
  const res = new Response(response.body, response);
  // Navegador sempre revalida; só a borda guarda por 60 s (fallback se o purge falhar).
  res.headers.set("cache-control", "public, max-age=0, must-revalidate");
  res.headers.set("cdn-cache-control", `max-age=${PUBLIC_EDGE_TTL_SECONDS}`);
  res.headers.set("cache-tag", PUBLIC_CACHE_TAG);
  return res;
}
