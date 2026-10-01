import { Suspense } from "react";
import { notFound } from "next/navigation";
import { SearchParamsProbe } from "./SearchParamsProbe";

// Fixture de e2e (hidratação + `useSearchParams` atrás do cache público). Nunca existe em produção.
export default function SearchParamsFixture() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <main>
      <Suspense fallback={<p data-testid="search-params">carregando</p>}>
        <SearchParamsProbe />
      </Suspense>
    </main>
  );
}
