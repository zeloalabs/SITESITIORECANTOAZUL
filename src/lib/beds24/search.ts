export type Stay = { checkin: string; checkout: string; nights: number; adults: number; children: number };
export type SearchError = "invalid_date" | "checkin_in_past" | "checkout_not_after_checkin" | "too_many_nights" | "invalid_guests";

const MAX_NIGHTS = 30;
const MAX_ADULTS = 20;
const MAX_CHILDREN = 10;
const MAX_GUESTS = 20;
const DAY_MS = 86_400_000;

export function todayInSaoPaulo(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

function parseIsoDate(value: string | null): number | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const parts = value.split("-").map(Number);
  const y = parts[0];
  const m = parts[1];
  const d = parts[2];
  if (y === undefined || m === undefined || d === undefined) return null;
  const time = Date.UTC(y, m - 1, d);
  const check = new Date(time);
  if (check.getUTCFullYear() !== y || check.getUTCMonth() !== m - 1 || check.getUTCDate() !== d) return null;
  return time;
}

function parseCount(value: string | null, fallback: number | null): number | null {
  if (value === null || value === "") return fallback;
  if (!/^\d+$/.test(value)) return null;
  return Number(value);
}

export function parseSearch(params: URLSearchParams, today: string): { ok: true; stay: Stay } | { ok: false; error: SearchError } {
  const checkinRaw = params.get("checkin");
  const checkoutRaw = params.get("checkout");
  const checkin = parseIsoDate(checkinRaw);
  const checkout = parseIsoDate(checkoutRaw);
  const todayTime = parseIsoDate(today);
  if (checkin === null || checkout === null || todayTime === null) return { ok: false, error: "invalid_date" };
  if (checkin < todayTime) return { ok: false, error: "checkin_in_past" };
  if (checkout <= checkin) return { ok: false, error: "checkout_not_after_checkin" };
  const nights = Math.round((checkout - checkin) / DAY_MS);
  if (nights > MAX_NIGHTS) return { ok: false, error: "too_many_nights" };

  const adults = parseCount(params.get("adultos"), null);
  const children = parseCount(params.get("criancas"), 0);
  if (adults === null || children === null) return { ok: false, error: "invalid_guests" };
  if (adults < 1 || adults > MAX_ADULTS || children > MAX_CHILDREN || adults + children > MAX_GUESTS) {
    return { ok: false, error: "invalid_guests" };
  }

  return { ok: true, stay: { checkin: checkinRaw!, checkout: checkoutRaw!, nights, adults, children } };
}
