import "server-only";
import { getServerEnv } from "@/lib/env";
import type { Beds24Result } from "./types";
import { CreditBreaker, MemoryBreakerStore } from "./breaker";

type ParamValue = string | number | boolean | Array<string | number>;
type LogEntry = { path: string; status: number | "timeout" | "network" | "skipped"; cost: number | null };

export type Beds24Client = {
  get<T>(path: string, params: Record<string, ParamValue>): Promise<Beds24Result<T>>;
};

function buildUrl(baseUrl: string, path: string, params: Record<string, ParamValue>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) value.forEach((v) => search.append(key, String(v)));
    else search.append(key, String(value));
  }
  const query = search.toString();
  return `${baseUrl}${path}${query ? `?${query}` : ""}`;
}

export function createBeds24Client(opts: {
  token: string | null;
  breaker: CreditBreaker;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
  baseUrl?: string;
  log?: (entry: LogEntry) => void;
}): Beds24Client {
  const fetchImpl = opts.fetchImpl ?? fetch;
  const timeoutMs = opts.timeoutMs ?? 4000;
  const baseUrl = opts.baseUrl ?? "https://api.beds24.com/v2";
  const log = opts.log ?? ((entry: LogEntry) => console.info("beds24", entry));

  return {
    async get<T>(path: string, params: Record<string, ParamValue>): Promise<Beds24Result<T>> {
      if (!opts.token) return { ok: false, error: "auth" };
      if (await opts.breaker.isOpen()) {
        log({ path, status: "skipped", cost: null });
        return { ok: false, error: "breaker_open" };
      }

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      let response: Response;
      try {
        response = await fetchImpl(buildUrl(baseUrl, path, params), {
          method: "GET",
          headers: { token: opts.token, accept: "application/json" },
          signal: controller.signal,
        });
      } catch (error) {
        const isAbort = (error as { name?: string } | null)?.name === "AbortError";
        log({ path, status: isAbort ? "timeout" : "network", cost: null });
        return { ok: false, error: isAbort ? "timeout" : "network" };
      } finally {
        clearTimeout(timer);
      }

      await opts.breaker.record(response.headers, response.status);
      const costHeader = Number(response.headers.get("x-request-cost"));
      log({ path, status: response.status, cost: Number.isFinite(costHeader) && response.headers.has("x-request-cost") ? costHeader : null });

      if (response.status === 401 || response.status === 403) return { ok: false, error: "auth" };
      if (response.status === 429) return { ok: false, error: "rate_limited" };
      if (!response.ok) return { ok: false, error: "http" };

      let body: { success?: boolean; data?: T };
      try {
        body = await response.json();
      } catch {
        return { ok: false, error: "api_error" };
      }
      if (body.success !== true || body.data === undefined) return { ok: false, error: "api_error" };
      return { ok: true, data: body.data };
    },
  };
}

const defaultBreakerStore = new MemoryBreakerStore();
const defaultBreaker = new CreditBreaker(defaultBreakerStore);

export function getSharedBreaker(): CreditBreaker {
  return defaultBreaker;
}

export function getBeds24Client(): Beds24Client {
  return createBeds24Client({
    token: getServerEnv().beds24Token,
    breaker: defaultBreaker,
  });
}
