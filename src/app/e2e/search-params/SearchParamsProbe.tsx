"use client";

import { useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";

const noopSubscribe = () => () => {};

export function SearchParamsProbe() {
  const searchParams = useSearchParams();
  // false no SSR e durante a hidratação; true depois que o cliente assume.
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  return (
    <p data-testid="search-params" data-hydrated={hydrated ? "yes" : "no"}>
      {searchParams.toString()}
    </p>
  );
}
