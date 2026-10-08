import { urlSearchParamPreviewSecret } from "@sanity/preview-url-secret/constants";

const noStore = { "cache-control": "private, no-store" };

/**
 * Porta de entrada do Draft Mode. Antes de delegar ao `defineEnableDraftMode` (que valida o segredo no Sanity):
 * - sem `sanity-preview-secret` na URL → 401, haja ou não token configurado;
 * - com segredo mas sem `SANITY_API_READ_TOKEN` no ambiente → 503 (configuração ausente, sem detalhes);
 * - segredo inválido → 401 (a validação fica a cargo do delegado).
 * Sem isso, a ausência do token virava `TypeError` dentro do delegado e uma resposta 500.
 */
export async function enableDraftModeGate(
  request: Request,
  token: string | undefined,
  delegate: (request: Request) => Promise<Response>,
): Promise<Response> {
  if (!new URL(request.url).searchParams.get(urlSearchParamPreviewSecret)) {
    return new Response("Invalid secret", { status: 401, headers: noStore });
  }
  if (!token) return new Response("Draft Mode unavailable", { status: 503, headers: noStore });
  return delegate(request);
}
