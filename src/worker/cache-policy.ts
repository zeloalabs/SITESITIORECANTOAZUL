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

export function isPublicCacheable(request: Request): boolean {
  if (request.method !== "GET" && request.method !== "HEAD") return false;
  const url = new URL(request.url);
  if (url.pathname === "/api" || url.pathname.startsWith("/api/")) return false;
  if (url.searchParams.has("_rsc") || request.headers.has("rsc")) return false;
  if (request.headers.has("authorization")) return false;
  return !hasDraftCookie(request);
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
