import { isValidSignature, SIGNATURE_HEADER_NAME } from "@sanity/webhook";

export const SANITY_WEBHOOK_PATH = "/api/sanity-webhook";

// Webhook de publicação do Sanity: valida a assinatura e limpa o cache público.
// Nunca registra corpo, assinatura ou secret.
export async function handleSanityWebhook(
  request: Request,
  secret: string | undefined,
  purgePublicCache: () => Promise<void>,
): Promise<Response> {
  const noStore = { "cache-control": "private, no-store" };
  if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405, headers: noStore });
  if (!secret) return new Response("Webhook not configured", { status: 500, headers: noStore });

  const signature = request.headers.get(SIGNATURE_HEADER_NAME);
  const body = await request.text();
  if (!signature || !(await isValidSignature(body, signature, secret).catch(() => false))) {
    return new Response("Unauthorized", { status: 401, headers: noStore });
  }

  try {
    await purgePublicCache();
  } catch {
    console.error("sanity-webhook: purge failed");
    return new Response("Purge failed", { status: 502, headers: noStore });
  }
  return new Response("Purged", { status: 200, headers: noStore });
}
