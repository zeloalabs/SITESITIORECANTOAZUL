export type Beds24ErrorKind = "breaker_open" | "rate_limited" | "auth" | "timeout" | "http" | "network" | "api_error";
export type Beds24Result<T> = { ok: true; data: T } | { ok: false; error: Beds24ErrorKind };
