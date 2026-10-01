import "server-only";

export type ServerEnv = {
  beds24Token: string | null;
  sanityReadToken: string | null;
  pricesEnabled: boolean;
};

type RawEnv = Record<string, string | undefined>;

function nonBlank(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function readServerEnv(raw: RawEnv): ServerEnv {
  return {
    beds24Token: nonBlank(raw.BEDS24_TOKEN),
    sanityReadToken: nonBlank(raw.SANITY_API_READ_TOKEN),
    pricesEnabled: raw.PRICES_ENABLED === "true",
  };
}

export function getServerEnv(): ServerEnv {
  return readServerEnv(process.env);
}
