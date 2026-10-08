export type BreakerState = { openUntil: number | null };

export interface BreakerStore {
  load(): Promise<BreakerState | null>;
  save(state: BreakerState): Promise<void>;
}

export const CREDIT_RESERVE = 20;
const DEFAULT_OPEN_MS = 5 * 60 * 1000;

export class MemoryBreakerStore implements BreakerStore {
  private state: BreakerState | null = null;
  async load() { return this.state; }
  async save(state: BreakerState) { this.state = { ...state }; }
}

function readNumber(headers: Headers, name: string): number | null {
  const raw = headers.get(name);
  if (raw === null) return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

export class CreditBreaker {
  private openUntil: number | null = null;
  private loaded = false;

  constructor(private readonly store: BreakerStore, private readonly now: () => number = Date.now) {}

  private async ensureLoaded() {
    if (this.loaded) return;
    this.openUntil = (await this.store.load())?.openUntil ?? null;
    this.loaded = true;
  }

  async isOpen(): Promise<boolean> {
    await this.ensureLoaded();
    if (this.openUntil === null) return false;
    if (this.now() < this.openUntil) return true;
    this.openUntil = null;
    await this.store.save({ openUntil: null });
    return false;
  }

  async record(headers: Headers, status: number): Promise<void> {
    await this.ensureLoaded();
    const now = this.now();
    const remaining = readNumber(headers, "x-five-min-limit-remaining");
    const resetsIn = readNumber(headers, "x-five-min-limit-resets-in");
    const shouldOpen = status === 429 || (remaining !== null && remaining < CREDIT_RESERVE);
    const alreadyOpen = this.openUntil !== null && now < this.openUntil;
    if (!shouldOpen || alreadyOpen) return;
    this.openUntil = resetsIn !== null ? now + resetsIn * 1000 : now + DEFAULT_OPEN_MS;
    await this.store.save({ openUntil: this.openUntil });
  }
}
