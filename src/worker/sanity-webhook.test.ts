// @vitest-environment node
import { describe, it, expect, vi } from "vitest";
import { encodeSignatureHeader, SIGNATURE_HEADER_NAME } from "@sanity/webhook";
import { handleSanityWebhook } from "./sanity-webhook";

const SECRET = "test-secret-not-real";
const body = JSON.stringify({ _id: "page-home", _type: "page" });

async function signed(payload = body, secret = SECRET) {
  const signature = await encodeSignatureHeader(payload, Date.now(), secret);
  return new Request("https://example.test/api/sanity-webhook", {
    method: "POST",
    headers: { [SIGNATURE_HEADER_NAME]: signature, "content-type": "application/json" },
    body: payload,
  });
}

describe("handleSanityWebhook", () => {
  it("purges the public cache on a valid signature", async () => {
    const purge = vi.fn().mockResolvedValue(undefined);
    const res = await handleSanityWebhook(await signed(), SECRET, purge);
    expect(res.status).toBe(200);
    expect(purge).toHaveBeenCalledOnce();
  });

  it("rejects an invalid signature without purging", async () => {
    const purge = vi.fn();
    const res = await handleSanityWebhook(await signed(body, "other-secret"), SECRET, purge);
    expect(res.status).toBe(401);
    expect(purge).not.toHaveBeenCalled();
  });

  it("rejects a missing signature header", async () => {
    const purge = vi.fn();
    const req = new Request("https://example.test/api/sanity-webhook", { method: "POST", body });
    expect((await handleSanityWebhook(req, SECRET, purge)).status).toBe(401);
    expect(purge).not.toHaveBeenCalled();
  });

  it("fails closed when the secret is not configured", async () => {
    const purge = vi.fn();
    expect((await handleSanityWebhook(await signed(), undefined, purge)).status).toBe(500);
    expect(purge).not.toHaveBeenCalled();
  });

  it("only accepts POST", async () => {
    const purge = vi.fn();
    const req = new Request("https://example.test/api/sanity-webhook");
    expect((await handleSanityWebhook(req, SECRET, purge)).status).toBe(405);
  });

  it("returns 502 when the purge fails, without leaking details", async () => {
    const purge = vi.fn().mockRejectedValue(new Error("boom internal"));
    const res = await handleSanityWebhook(await signed(), SECRET, purge);
    expect(res.status).toBe(502);
    expect(await res.text()).not.toContain("boom");
  });
});
