import { describe, expect, it, vi } from "vitest";
import { enableDraftModeGate } from "./draft-mode";

const url = (qs = "") => new Request(`https://site.test/api/draft-mode/enable${qs}`);

describe("enableDraftModeGate", () => {
  it("sem segredo na URL: 401, mesmo sem token configurado, e não chama o delegado", async () => {
    const delegate = vi.fn();
    for (const token of [undefined, "tok"]) {
      const res = await enableDraftModeGate(url(), token, delegate);
      expect(res.status).toBe(401);
      expect(res.headers.get("cache-control")).toBe("private, no-store");
    }
    expect((await enableDraftModeGate(url("?sanity-preview-secret="), "tok", delegate)).status).toBe(401);
    expect(delegate).not.toHaveBeenCalled();
  });

  it("com segredo mas sem token no ambiente: 503 genérico, sem vazar nada", async () => {
    const delegate = vi.fn();
    const res = await enableDraftModeGate(url("?sanity-preview-secret=abc"), undefined, delegate);
    expect(res.status).toBe(503);
    const body = await res.text();
    expect(body).toBe("Draft Mode unavailable");
    expect(body).not.toContain("abc");
    expect(delegate).not.toHaveBeenCalled();
  });

  it("segredo inválido: a resposta 401 do delegado é preservada", async () => {
    const delegate = vi.fn(async () => new Response("Invalid secret", { status: 401 }));
    const res = await enableDraftModeGate(url("?sanity-preview-secret=errado"), "tok", delegate);
    expect(res.status).toBe(401);
    expect(delegate).toHaveBeenCalledOnce();
  });

  it("caminho válido: devolve a resposta do delegado (redirect/ok) com a mesma requisição", async () => {
    const delegate = vi.fn(async (r: Request) => Response.redirect(new URL("/", r.url), 307));
    const req = url("?sanity-preview-secret=ok");
    const res = await enableDraftModeGate(req, "tok", delegate);
    expect(res.status).toBe(307);
    expect(delegate).toHaveBeenCalledWith(req);
  });
});
